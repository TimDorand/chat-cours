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
    var new_channel_name = document.querySelector('#room_name_input');
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
        $('#events').append(`<span data-username='${username}'>${username} est en train d'écrire <img style="width: 60px;" src="/dist/img/loader.png" alt=""><br></span>`);
    });

    socket.on('message.end_tipping', function(username) {
        $('#events').find(`span[data-username="${username}"]`).remove();
    });

    $('form').submit(function(e){
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
                div.innerHTML =  `<button class="btn btn-primary btn-room">${room}</button>`;

                selectors.rooms.appendChild(div);
                changeRoom(current_room);
            }
        });

        all_rooms = document.querySelectorAll(".room");

        if (all_rooms !== undefined) {
            all_rooms.forEach((room) => {
                room.addEventListener('click', () => {
                    document.getElementById('messages').innerHTML = "";

                    changeRoom(room.dataset.channelName);
                });
            });
        }

        scrollbottom();
    });

    socket.on('messages.getAll', (datas) => {
        datas = datas.reverse();
        document.getElementById('messages').innerHTML = "";

        datas.forEach(function(msg) {
            showMsg(msg);
        });
    });

    function showMsg (json) {
        const data = JSON.parse(json);
        var author_msg = "";
        var class_msg = "";
        var float = "";

        var timestamp = new Date(data.time);

        var date = timestamp.getDate();
        var month = timestamp.getMonth()+1;
        var year = timestamp.getFullYear();
        var hour = timestamp.getHours();
        var minute = timestamp.getMinutes();

        if (minute < 10) minute = '0' + minute;

        var original_date = "le " + date + '/' + month + '/' + year + ' à ' + hour + 'h' + minute;

        if (username === data.username) {
            author_msg = original_date;
            class_msg = 'own-msg';
            float = 'float-right';
        }
        else {
            author_msg = data.username + ' ' + original_date;
            class_msg = 'other-msg';
        }

        messages.append(`
            <div class="row">
                <span class="name ${float}">${author_msg}</span><br>
                <li class="msg ${class_msg}">${data.message}</li>
            </div>
        `);
    }

    function changeRoom (channelName) {
        socket.emit('room.join', channelName);
        $(".btn-room").removeClass('btn-success').addClass('btn-primary');
        $('#'+channelName).find('.btn-room').removeClass('btn-primary').addClass('btn-success');
    }
})(jQuery);