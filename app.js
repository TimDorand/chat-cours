require('colors');

const express = require('express');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const requestIp = require('request-ip');
const redis = require("redis");
const insult = require("./api/insult.js");

const client = redis.createClient();

app.set('view engine', 'ejs');
app.use(express.static('views'));

function consoleLog(event, method, msg = undefined) {
    console.log(event.red + '.' + method.yellow + (msg !== undefined ? (' => ' + msg) : ''));
}

app.get('/', (req, res) => res.render(__dirname + '/views/templates/index'));

io.on('connection', function (socket) {
    consoleLog('socket', 'connection', 'another user connected');

    socket.on('chat.join', (data, name) => {
        const json = JSON.parse(data);

        //1. Save default room
        client.sadd('rooms', 'home', (err, reply) => {
            if (err) throw err;
            consoleLog('redis', 'SET default room', 'default channel : home');
        });

        //1. Save username
        socket.username = json.username;
        socket.userIp = requestIp.getClientIp(socket.request);
        socket.chatroom = 'home';

        client.hmset(`users:${socket.username}`, 'username', socket.username, 'ip', socket.userIp, (err, res) => {
            consoleLog('redis', 'HMSET users', `Add ${socket.username} to user Set`);
        });

        consoleLog('redis', 'HMSET users', `Add ${socket.username} to user Set`);

        //2. The user officially join the room
        socket.join(socket.chatroom);

        consoleLog('chat', 'join', `${socket.username} has IP ${socket.userIp}`);
        consoleLog('chat', 'join room', `${socket.username} join channel : ${name}`);

        //3. broadcast
        client.hgetall(`users:${socket.username}`, function (err, res) {
            if (err) throw(err);
            socket.broadcast.to(socket.chatroom).emit('chat.join', res, socket.chatroom);
        });

        client.keys('users:*', function (err, res) {
            if (err) throw(err);
            for (let user of res) {
                client.hgetall(user, function (err, res) {
                    if (err) throw(err);
                    socket.emit('chat.join', res, socket.chatroom);
                });
            }
        });

        //4. send all rooms
        client.smembers('rooms', (err, rooms) => {
            if (err) throw err;

            socket.broadcast.emit('rooms', rooms);
            socket.emit('rooms', rooms);
        });

        //5. send last 20 messages
        client.lrange(`messages:${socket.chatroom}`, 0, 19, (err, msgs) => {
            socket.emit('messages.getAll', msgs);
        });
    });

    socket.on('chat.message', function (message) {
        consoleLog('chat', 'message', ('[' + socket.username + ']').bold + ' message : ' + message);

        // Need to pass a sentence and the insultDetector return a new sentence without insults :)
        message = insult.insultDetector(message);

        const json = JSON.stringify({username: socket.username, message, time: Date.now()});

        client.lpush(`messages:${socket.chatroom}`, json, (err, reply) => {
            if (err) throw err;
        });

        socket.emit('chat.message', json);
        socket.broadcast.to(socket.chatroom).emit('chat.message', json);
    });

    socket.on('room.create', function (user, channel_name) {
        client.sadd('rooms', channel_name, (err, reply) => {
            if (err) throw err;

            consoleLog('redis', 'SET new room', `New channel ${channel_name}`);

            client.smembers('rooms', (err, rooms) => {
                if (err) throw err;

                socket.broadcast.emit('rooms', rooms);
                socket.emit('rooms', rooms);
            });
        });
    });

    socket.on('room.join', function (channelName) {
        socket.leave(socket.chatroom, () => {
            socket.chatroom = channelName;
            socket.join(socket.chatroom);
            //3. broadcast
            client.hgetall(`users:${socket.username}`, function (err, res) {
                if (err) throw(err);
                socket.broadcast.to(socket.chatroom).emit('chat.join', res, socket.chatroom);
            });

            //5. send last 20 messages
            client.lrange(`messages:${socket.chatroom}`, 0, 19, (err, msgs) => {
                socket.emit('messages.getAll', msgs);
            });
        });
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
        socket.leave(socket.chatroom);

        socket.broadcast.to(socket.chatroom).emit('chat.leave', {username: socket.username});
        socket.emit('chat.leave', {username: socket.username});

        client.del(`users:${socket.username}`, function(err, reply) {
            consoleLog('chat', 'disconnect', ('[' + socket.username + ']').bold + ' leave the channel');
        });
    });

    socket.on('message.tipping', function(username) {
        socket.broadcast.to(socket.chatroom).emit('message.tipping', username);
    });

    socket.on('message.end_tipping', function(username) {
        socket.broadcast.to(socket.chatroom).emit('message.end_tipping', username);
    })

});

http.listen(3000, () => console.log('Listening on ' + 'http://localhost:3000\n'.green));
