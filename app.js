require('colors');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const requestIp = require('request-ip');
const redis = require("redis");
const client = redis.createClient();

function consoleLog(event, method, msg = undefined) {
  console.log(event.red + '.' + method.yellow + (msg !== undefined ? (' => ' + msg) : ''));
}

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', function(socket){
  consoleLog('socket', 'connection', 'another user connected');

  socket.broadcast.emit('hi');

  socket.on('chat.join', username => {
    const user_ip = requestIp.getClientIp(socket.request);
    consoleLog('chat', 'join', `${username} has IP ${user_ip}`);
    //1. save username
    // DELETE Hash Key : client.hdel('frameworks', 'javascript', 'AngularJS', 'css', 'Bootstrap', 'node', 'Express');
    socket.username = username;
    socket.userIp = user_ip;

    let user_infos = {
      'ip': user_ip,
      'username': username
    };

    console.log(JSON.stringify(user_infos));

    client.hmset(username, {
      username: JSON.stringify(user_infos)
    });

    client.hgetall(username, function(err, object) {
      console.log(object);
    });

    //2. broadcast
    socket.broadcast.emit('chat.join', username);
  });

  socket.on('chat.message', function(msg){
    consoleLog('chat', 'message', ('[' + socket.username + ']').bold + 'message : ' + message);
    socket.broadcast.emit('chat.message', msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, () => console.log('Listening on '  + 'http://localhost:3000\n'.green));
