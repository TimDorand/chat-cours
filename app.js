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
app.get('/room1', (req, res) => res.render(__dirname + '/views/templates/room1'));

io.on('connection', function(socket){
    consoleLog('socket', 'connection', 'another user connected');

  socket.on('chat.join', (data, name) => {
    const json = JSON.parse(data);

    //1. save username
    socket.username = json.username;
    socket.userIp = requestIp.getClientIp(socket.request);
    socket.chatroom = name;

    consoleLog('chat', 'join room', `${socket.username} join channel : ${name}`);

    socket.join(socket.chatroom);

    consoleLog('chat', 'join', `${socket.username} has IP ${socket.userIp}`);

        client.hmset(`users:${socket.username}`, 'username', socket.username, 'ip', socket.userIp, (err, res) => {
            consoleLog('redis', 'HMSET users', `Add ${socket.username} to user Set`);
            console.log(res);
        });

        client.lrange('messages', 0, 19, (err, msgs) => {
            socket.emit('messages.getAll', msgs);
        });

      consoleLog('redis', 'HMSET users', `Add ${socket.username} to user Set`);
    });

    //2. broadcast
    client.hgetall(`users:${socket.username}`, function(err, res) {
      if (err) throw(err);
      socket.broadcast.to(socket.chatroom).emit('chat.join', res);
    });
    socket.on('chat.message', function(message){
        consoleLog('chat', 'message', ('[' + socket.username + ']').bold + ' message : ' + message);
        const json = JSON.stringify({username: socket.username, message});

    client.keys('users:*', function(err, res) {
      if (err) throw(err);
      for (let user of res) {
        client.hgetall(user, function(err, res) {
          if (err) throw(err);
          console.log(res);
          socket.emit('chat.join', res);
        });
      }
    });

    client.smembers('rooms', (err, rooms) => {
      if (err) throw err;

      socket.broadcast.emit('rooms', rooms);
      socket.emit('rooms', rooms);
    });
  });
        client.lpush('messages', json, (err, reply) => {
            console.log('redis lpush => ' + reply);
        });

        socket.emit('chat.message', json);
    socket.broadcast.to(socket.chatroom).emit('chat.message', msg);

  socket.on('room.create', function (user, channel_name) {
    client.sadd('rooms', channel_name, (err, rooms) => {
      if (err) throw err;

      consoleLog('redis', 'SET new room', `New channel ${channel_name}`);

      client.smembers('rooms', (err, rooms) => {
        if (err) throw err;

        socket.broadcast.emit('room.create', rooms);
        socket.emit('room.create', rooms);
      });
    });
  });


  socket.on('disconnect', function(){
    console.log('user disconnected');
    socket.leave(socket.chatroom);

    socket.broadcast.to(socket.chatroom).emit('chat.leave', { username: socket.username });
    socket.emit('chat.leave', { username: socket.username });
  });
});

http.listen(3000, () => console.log('Listening on '  + 'http://localhost:3000\n'.green));
