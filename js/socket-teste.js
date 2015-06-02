
var address = require('network-address');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World! From my personal server!!! IP Adress:'+address())
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port



  console.log('Example app listening at http://%s:%s', host, port)

})


/**
 * Module dependencies
 

var express = require('express');
var sio = require('socket.io');
var http = require('http');


var app = express();

app.use(express.static('rc/static'));

var server = http.createServer(app).listen(8889);

var io = sio.listen(server);

io.set('log level', 0);

io.sockets.on('connection', function(socket){
 
  var movies = App.getTorrentsCollection({
    searchTerm: null,
    genre: null
  });

  movies.fetch();

  movies.on('add', function(movie){
    socket.emit('movie', movie);
  })

  socket.on('play', function(data){
    var movie = movies.find(function(model) { return model.get('torrent') === data.torrent; });
    console.log(movie.get('torrent'));
    App.sidebar.model = movie;
    App.sidebar.play($.Event('click'));
  });

});


*/