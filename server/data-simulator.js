var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(6000);

io.on('connection', function (socket) {
      console.log('Client Connected')
      socket.emit('live-data', { hello: 'world' });

      // socket.on('my other event', function (data) {
      //       console.log(data);
      // });
});
