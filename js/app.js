// Ionic Starter App

angular.module("RecursionHelper",[]).factory("RecursionHelper",["$compile",function(n){return{compile:function(e,o){angular.isFunction(o)&&(o={post:o});var r,p=e.contents().remove();return{pre:o&&o.pre?o.pre:null,post:function(e,t){r||(r=n(p)),r(e,function(n){t.append(n)}),o&&o.post&&o.post.apply(null,arguments)}}}}}]);

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'RecursionHelper'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  var path = require('path');
  var fs = require('fs');
  var os = require('os');
  var tempFolder = path.join(os.tmpDir(), 'Popcorn-Time');

  if( ! fs.existsSync(tempFolder) ) { fs.mkdir(tempFolder); }


  window.watchTorrent = function(torrentObj){

    console.log(torrentObj);

    var MIN_PERCENTAGE_LOADED = 0.5;
    var MIN_SIZE_LOADED = 10 * 1024 * 1024;
      
    var torrent = torrentObj.url;
    var tmpFilename = ( torrent.toLowerCase().split('/').pop().split('.torrent').shift() ).slice(0,100);
        tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') + '.mp4';

    var numConnections = 100;

    var tmpFile = path.join(tempFolder, tmpFilename);
    var popcornflix = require('peerflix');

    var magnetURL = "magnet:?xt=urn:btih:";
        magnetURL = magnetURL.concat(torrentObj.hash);
        magnetURL = magnetURL.concat("&dn="+torrentObj.url);
        magnetURL = magnetURL.concat("&tr=udp://open.demonii.com:1337");
        magnetURL = magnetURL.concat("&tr=udp://tracker.istole.it:80");
        magnetURL = magnetURL.concat("&tr=http://tracker.yify-torrents.com/announce");
        magnetURL = magnetURL.concat("&tr=udp://tracker.publicbt.com:80");
        magnetURL = magnetURL.concat("&tr=udp://tracker.openbittorrent.com:80");
        magnetURL = magnetURL.concat("&tr=udp://tracker.coppersurfer.tk:6969");
        magnetURL = magnetURL.concat("&tr=udp://exodus.desync.com:6969");
        magnetURL = magnetURL.concat("&tr=http://exodus.desync.com:6969/announce");

    /*
    torrent = torrent.replace("https", "http");
    var http = require('http');
        http.get(torrent).on('response', function (response) {
        var body = '';
        var i = 0;
        response.on('data', function (chunk) {
                i++;
                body += chunk;
                console.log('BODY Part: ' + i);
            });
            response.on('end', function () {
                console.log('Finished');
                startStream(tmpFile, body);
        });
    });
    */

    //console.log(magnetURL);
    //console.log(torrent);
    console.log(tmpFile);

    function progressCallback(percent, now, total){
      console.log('percent:'+percent+' now:'+now+'  total:'+total);
    }

    function torrentCallback(err, flix){
      console.log("CALLBACK");
      console.log(err);
      console.log(flix);

        if (err) throw err;
        var started = Date.now(),
          loadedTimeout;

          flix.server.on('listening', function () {
            var href = 'http://127.0.0.1:' + flix.server.address().port + '/';

            loadedTimeout ? clearTimeout(loadedTimeout) : null;

            var checkLoadingProgress = function () {

              var now = flix.downloaded,
                total = flix.selected.length,
              // There's a minimum size before we start playing the video.
              // Some movies need quite a few frames to play properly, or else the user gets another (shittier) loading screen on the video player.
                targetLoadedSize = MIN_SIZE_LOADED > total ? total : MIN_SIZE_LOADED,
                targetLoadedPercent = MIN_PERCENTAGE_LOADED * total / 100.0,

                targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),

                percent = now / targetLoaded * 100.0;

              if (now > targetLoaded) {
                
                window.location = '#/app/player/';
                console.log('loaded');
                console.log('#/app/player/'+href);

                /*
                if (typeof window.spawnVideoPlayer === 'function') {
                  window.spawnVideoPlayer(href, subs, movieModel);
                }
                */
                if (typeof callback === 'function') {
                  callback(href, subs, movieModel);
                }
              } else {
                typeof progressCallback == 'function' ? progressCallback( percent, now, total) : null;
                loadedTimeout = setTimeout(checkLoadingProgress, 500);
              }
            };
            checkLoadingProgress();

          });//flix.server
    }//torrentCallback

    var videoStreamer = popcornflix(torrent, {
        // Set the custom temp file
        path: tmpFile,
        //port: 554,
        buffer: (1.5 * 1024 * 1024).toString(),
        connections: numConnections
      }, torrentCallback);

        
  }//end watchTorrent



  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "templates/search.html"
      }
    }
  })

  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html"
      }
    }
  })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent': {
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.playvideo', {
      url: "/player/:videoCod",
      views: {
        'menuContent': {
          templateUrl: "templates/player.html",
          controller: 'PlayerCtrl'
        }
      }
    })

    .state('app.treeview', {
      url: "/treeview",
      views: {
        'menuContent': {
          templateUrl: "templates/treeview.html",
          controller: 'TreeView'
        }
      }
    })

    .state('app.dataMining', {
      url: "/datamining",
      views: {
        'menuContent': {
          templateUrl: "templates/data_mining.html",
          controller: 'DataMiningCtrl'
        }
      }
    })

  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/playlist.html",
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/treeview');
});

app.factory('fileSrvc', ['$q', function($q){

    var folderCache = {};
    var srcpath = 'Z:\\';
    var fs = require('fs'),
        os = require('os'),
        path = require('path');

    this.readFolder = function(_path){
      if(folderCache[_path] != null){
        return folderCache[_path];
      }

      folderCache[_path] = new Array();

      fs.readdirSync(_path).filter(function(file) {
        var dirPath = path.join(_path, file);
        var isdir = fs.statSync(dirPath).isDirectory();

        folderCache[_path].push({name:file, path: dirPath, isdir: isdir});

        return isdir;
      });

      return folderCache[_path];
    }

    this.listWebs = function(){
      var dirList = new Array();

      fs.readdirSync(srcpath).filter(function(file) {
        var dirPath = path.join(srcpath, file);
        var isdir = fs.statSync(dirPath).isDirectory();

        (isdir == true && dirPath.indexOf("dsv") !== -1)? dirList.push({name:file, path: dirPath}) : null;

        return isdir;
      });

      return dirList;
    }//end listWebs

    this.setSrcPath = function(src){
      srcpath = src+":\\";
    }

    this.getSrcPath = function(){
      return srcpath;
    }

    this.changeSrcToDist = function(path){
      var output = "";
      fs.readFile(srcpath+path+'/js/main.min.js', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }

        if(data.indexOf('appCFO_baseUrl="src";') == -1){ return; }

        data = data.replace('appCFO_baseUrl="src";', 'appCFO_baseUrl="dist";');
        fs.writeFile(srcpath+path+'/js/main.min.js', data, function(err) {
            if(err) {
                return console.log(err);
            }
        }); 
      });

      //Change main.js source on main.master file
      fs.readFile(srcpath+path+'/masterpage/main.master', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }

        console.log(data.indexOf('<script data-main="/js/main" src="/js/libs/require.js"></script>'));

        if(data.indexOf('<script data-main="/js/main" src="/js/libs/require.js"></script>') == -1){ return; }

        data = data.replace('<script data-main="/js/main" src="/js/libs/require.js"></script>', 
          '<script data-main="/js/main.min" src="/js/libs/require.js"></script>');

        fs.writeFile(srcpath+path+'/masterpage/main.master', data, function(err) {
            if(err) {
                return console.log(err);
            }
        }); 
      });

      return output;
    }

    return this;

}]);

app.factory('compilerSrvc', ['$q', function($q){

    this.runGruntCommand = function(web, type, proj){

    }

    return this;

}]);

app.directive("tree", function(RecursionHelper, fileSrvc, compilerSrvc) {
    return {
        restrict: "E",
        scope: {
          file: '=',
          mainScope: '='
        },
        templateUrl: 'folder-list.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){
                scope.subList = {};

                scope.runGruntCommand = function(web, type, proj){
                  web = web.replace(fileSrvc.getSrcPath(), '');
                  scope.mainScope.runGruntCommand(web, type, proj);
                }

                scope.readFolder = function(file){
                  if(file.isdir == false){ return; }

                  var path = file.path;
                  if(scope.subList[path] != null){
                    scope.subList[path] = null;
                    return;
                  }
                  scope.subList[path] = fileSrvc.readFolder(path);
                  $ionicScrollDelegate.resize();
                }

            });
        }
    };
});