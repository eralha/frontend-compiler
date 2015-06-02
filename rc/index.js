
/**
 * Module dependencies
 */

var express = require('express');
var sio = require('socket.io');
var http = require('http');


var app = express();

app.use(express.static('rc/static'));

var server = http.createServer(app).listen(8889);

var io = sio.listen(server);

io.set('log level', 0);

io.sockets.on('connection', function(socket){

  socket.on('videoClick', function(data){
    window.location = "#/app/player/"+data;
  });

});