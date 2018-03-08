require('colors');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const requestIp = require('request-ip');
const redis = require("redis");
const client = redis.createClient();

app.set('view engine', 'ejs');

function consoleLog(event, method, msg = undefined) {
    console.log(event.red + '.' + method.yellow + (msg !== undefined ? (' => ' + msg) : ''));
}

app.get('/', (req, res) => res.render(__dirname + '/views/templates/index'));

io.on('connection', function(socket){
    consoleLog('socket', 'connection', 'another user connected');

    socket.broadcast.emit('hi');

    socket.on('chat.join', (data) => {
        const json = JSON.parse(data);

        //1. save username
        socket.username = json.username;
        socket.userIp = requestIp.getClientIp(socket.request);

        consoleLog('chat', 'join', `${socket.username} has IP ${socket.userIp}`);

        client.hmset(`users:${socket.username}`, 'username', socket.username, 'ip', socket.userIp, (err, res) => {
            consoleLog('redis', 'HMSET users', `Add ${socket.username} to user Set`);
            console.log(res);
        });

        client.lrange('messages', 0, 19, (err, msgs) => {
            socket.emit('messages.getAll', msgs);
        });

        //2. broadcast
        socket.broadcast.emit('chat.join', JSON.stringify({'username': socket.username}));
        /*client.smembers('users', function(err, res) {
          if (err) throw(err);
          console.log(res);

          for (let data of res) {
            socket.emit('chat.join', data);
          }
        });*/
    });

    socket.on('chat.message', function(message){
        consoleLog('chat', 'message', ('[' + socket.username + ']').bold + ' message : ' + message);
        const json = JSON.stringify({username: socket.username, message});

        client.lpush('messages', json, (err, reply) => {
            console.log('redis lpush => ' + reply);
        });

        socket.broadcast.emit('chat.message', json);
        socket.emit('chat.message', json);
    });


    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(3000, () => console.log('Listening on '  + 'http://localhost:3000\n'.green));
