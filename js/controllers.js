angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, fileSrvc) {

  $ionicModal.fromTemplateUrl('settings.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.settingsModal = modal;
  });

  $scope.driveName = fileSrvc.getSrcPath();

  $scope.$watch('driveName', function(newValue){
    console.log("new drive name: "+fileSrvc.getSrcPath());
    $scope.driveName = String($scope.driveName).replace(':\\', '');
  });
  
  $scope.showSettings = function(){
    $scope.settingsModal.show();
  }
  $scope.hideSettings = function(){
    $scope.settingsModal.hide();
  }
  $scope.fieldBlur = function(childScope){
    $scope.driveName = childScope.driveName;
    fileSrvc.setSrcPath($scope.driveName);
  }

})

.controller('DataMiningCtrl', function($scope, $ionicModal, $timeout, fileSrvc) {

  var request = require("request"),
      cheerio = require("cheerio"),
      url = "http://www.accuweather.com/pt/pt/lisbon/274087/weather-forecast/274087";
      
      request(url, function (error, response, body) {
        if (!error) {
          console.log(response);
          var $ = cheerio.load(body);
          $scope.temp = $("#feed-main .cond").text()+" "+$("#feed-main .temp").text();
          $scope.$apply();
          console.log($scope.temp);
        } else {
          console.log("We’ve encountered an error: " + error);
        }
      });

})

.controller('PlaylistsCtrl', function($scope, $http, $ionicScrollDelegate, $sce) {

  $scope.searching = true;
  $scope.playing = false;
  $scope.movies = new Array();
  var apiURL = "https://yts.re/api/v2/list_movies.json";
  var page = 0;

  $scope.loadMovies = function(){
    page ++;

    var moviesendPoint = apiURL+'?page='+page;

    $http.get(moviesendPoint).
    success(function(data, status, headers, config) {
      //console.log(data);

      var movies = data.data.movies;
      for(i in movies){
        $scope.movies.push(movies[i]);
      }

      $scope.$broadcast('scroll.infiniteScrollComplete');
    }).error(function() {

    });//end http
  }

  $scope.watchTorrent = function(torrentObj){
    window.watchTorrent(torrentObj);
  }//end watchTorrent

})

.controller('TreeView', function($scope, $stateParams, $sce, $ionicModal, fileSrvc, $ionicScrollDelegate) {

  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.dirList = new Array();
  $scope.subList = {};
  $scope.output = new Array();
  $scope.ctrll = $scope;

  /*
  var grunt = require('grunt');

  grunt.registerTask('default', 'Log some stuff.', function() {
      console.log('stuff');
  });
*/

  $scope.$watch('searchText', function(){
    $ionicScrollDelegate.resize();
  });

  function parseStdData(data){
    var out = data.toString().replace(/([\s])/g,"");
    var parsed = data.toString();
        parsed = parsed.replace(/(?:\[[0-9]*m)+/g,"");
        parsed = parsed.replace(/(?:\[[0-9]*m>>)+/g,"");
        parsed = parsed.replace(/(?:WARN\:)+/g,"<br />WARN:");
        parsed = parsed.replace(/^(<br \/>)/g,"");

    console.log('stdout: ' + out);
    if(out != ""){
      $scope.output.push({data: parsed});
      $scope.modal.show();
    }
    $ionicScrollDelegate.scrollBottom();
  }

  $scope.runGruntCommand = function(web, type, proj){
    $scope.output = new Array();
    $scope.output.push({data: "Aguardar resposta..."});
    $scope.modal.show();

    $ionicScrollDelegate.resize();

    console.log(web+"  "+type+"  "+proj);
    //grunt.tasks(['default']);

    var command = fileSrvc.getSrcPath()+'grunttasks\\grunt '+type+' --web='+web;
        command = (proj)? command+' --proj='+proj : command;

        $scope.output.push({data: "Running command: "+command});

    var spawn = require('child_process').spawn;
    var ls    = spawn('cmd.exe', ['/c', command], {cwd : 'z:\\grunttasks\\'});
    //var ls    = spawn('cmd.exe', ['/c', 'c:\\git\\apk\\teste.bat']);

        ls.stdout.on('data', function (data) {
          parseStdData(data);
        });//end stdout

        ls.stderr.on('data', function (data) {
          parseStdData(data);
        });

        ls.on('exit', function (code) {
          console.log('child process exited with code ' + code);
          if(proj == "angular"){ 
            fileSrvc.changeSrcToDist(web); 
            $scope.output.push({data: 'src/ path changed to dist/ path in file: '+web+'/js/main.min.js'});
            $scope.output.push({data: '/masterpage/main.master changed Set:'});
            $scope.output.push({data: 'script data-main="/js/main.min" src="/js/libs/require.js"'});
          }
          $scope.output.push({data: "Done!"});
          $scope.modal.show();
          $ionicScrollDelegate.scrollBottom();
          //Change src path to dist path in js files
        });
  }//end runGruntCommand

  $scope.listWebFiles = function(_dirPath){
    if($scope.subList[_dirPath] != null){
      $scope.subList[_dirPath] = null;
      return;
    }
    $scope.subList[_dirPath] = fileSrvc.readFolder(_dirPath);
    $ionicScrollDelegate.resize();
  }//end listWebFiles

  $scope.clearSearch = function(){
    $scope.searchText = "";
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollTop();
  }

  function listWebs(){
    $scope.dirList = fileSrvc.listWebs();
  }//end listWebs

  //list inital folders
  listWebs();

});