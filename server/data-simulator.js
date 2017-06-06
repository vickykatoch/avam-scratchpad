const app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/api/test', function (req, res) {
      console.log('Request Received');
      res.send('Hello World!');
});

// io.on('connection', function (socket) {
//       console.log('Client Connected')
//       socket.emit('live-data', { hello: 'world' });
// });

server.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});