(function ($) {
    var selectors = {
        rooms: document.querySelector('.rooms')
    };
    var cacheSelector = {};
    var socket = io();
    var users = $('#users');
    var messages = $('#messages');
    var username;
    var channel_name;
    var add_btn = document.querySelector('.add_room');
    var new_channel_name = document.querySelector('.room_name_input');
    var all_rooms;

    if (typeof(Storage) !== undefined) {
        username = localStorage.getItem('username');
        console.log(`username from localStorage is ${username}`);
    }

    while (username === undefined || username === null || username.trim() === '') {
        username = prompt('What is your username?');

        if (typeof(Storage) !== undefined) {
            localStorage.setItem('username', username);
        }
    }

    var scrollbottom = function () {
        messages.scrollTop(messages[0].scrollHeight);
    };

    socket.emit('chat.join', JSON.stringify({ 'username': username }), channel_name ? channel_name : 'home');

    add_btn.addEventListener('click', () => {
        if (new_channel_name.value === '') {
            alert('new room name cannot be null!!');
            return;
        }

        socket.emit('room.create', JSON.stringify({ 'username': username }), new_channel_name.value);

        new_channel_name.value = '';
    });

    cacheSelector.message = $('#m');

    cacheSelector.message.focusin(function () {
        socket.emit('message.tipping', username)
    });

    cacheSelector.message.focusout(function () {
        socket.emit('message.end_tipping', username)
    });

    socket.on('message.tipping', function (username) {
        $('#tipping').append(`<span data-username='${username}'>${username} is tipping...</span>`);
    });

    socket.on('message.end_tipping', function(username) {
        $('#tipping').find(`span[data-username="${username}"]`).remove();
    });

    $('form').submit(function(e){
        console.log(cacheSelector.message.val());
        if (cacheSelector.message.val() !== "") {
            socket.emit('chat.message', cacheSelector.message.val());
            cacheSelector.message.val('');
            return false;
        }
        else {
            alert('Trying to send empty message');
            e.preventDefault();
        }
    });

    socket.on('chat.join', (data, channel) => {
        if (channel) channel_name = channel;
        data.username = data.username === username ? 'vous' : data.username;
        console.log(data.username);

        scrollbottom();

        if (!users.find(`li[data-username="${data.username}"]`)[0]) {
            users.append(`
                <li class="user_list" data-username="${data.username}">
                    <i class="fa fa-circle" aria-hidden="true" style="color: #22D0B2; font-size: 0.7em;"></i>
                    <b>${data.username}</b>
                </li>
            `);
        }
    });

    socket.on('chat.message', (json) => {
        showMsg(json);
        scrollbottom();
    });

    socket.on('chat.leave', (user) => {
        messages.append(`<span>${user.username} leaved the channel</span>`);
        users.find(`li[data-username="${user.username}"]`).remove();
    });

    socket.on('rooms', (rooms) => {
        rooms.forEach(room => {
            current_room = room.replace(' ', '_');

            if (!document.querySelector(`div#${current_room}`)) {
                var div = document.createElement('div');

                div.className = 'room';
                div.id = current_room;
                div.setAttribute('data-channel-name', current_room);
                div.innerHTML = `
                    <div class="tile is-ancestor">
                        <div class="tile is-vertical is-12 is-expanded">
                            <div class="tile">
                                <div class="tile is-parent is-vertical">
                                    <article class="tile is-child notification is-primary has-text-centered">
                                        <b>${room}</b>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </div>`;

                selectors.rooms.appendChild(div);
            }
        });

        all_rooms = document.querySelectorAll(".room");

        if (all_rooms !== undefined) {
            all_rooms.forEach((room) => {
                room.addEventListener('click', () => {
                    console.log(channel_name);
                    document.getElementById('messages').innerHTML = "";

                    changeRoom(room.dataset.channelName);
                });
            });
        }
    });

    socket.on('messages.getAll', (datas) => {
        console.log(datas);
        datas = datas.reverse();
        document.getElementById('messages').innerHTML = "";

        datas.forEach(function(msg) {
            showMsg(msg);
        });
    });

    function showMsg (json) {
        const data = JSON.parse(json);
        var author_msg = "";
        username === data.username ? author_msg = "Moi" : author_msg = data.username;
        messages.append(`
            <i>${author_msg}</i>
            <div class="notification ${ author_msg === "Moi" ? 'is-info' : 'is-primary' }">
              <!--<button class="delete"></button>-->
              ${data.message}
            </div>
        `);
    }

    function changeRoom (channelName) {
        socket.emit('room.join', channelName);
    }
})(jQuery);