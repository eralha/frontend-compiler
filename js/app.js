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
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

    .state('app.treeview', {
      url: "/treeview/:drive",
      views: {
        'menuContent': {
          templateUrl: "templates/treeview.html",
          controller: 'TreeView'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/treeview/dsv');
});

app.factory('fileSrvc', ['$q', function($q){

    var folderCache = {};
    var srcpath = 'Z:\\';
    var tstpath = 'X:\\';
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

    this.listWebs = function(server){
      var dirList = new Array();

      var _driveToRead = (server == 'tst')? tstpath : srcpath;

      fs.readdirSync(_driveToRead).filter(function(file) {
        var dirPath = path.join(_driveToRead, file);
        var isdir = fs.statSync(dirPath).isDirectory();

        (isdir == true && dirPath.indexOf("dsv") !== -1 || dirPath.indexOf("tst") !== -1)? dirList.push({name:file, path: dirPath}) : null;

        return isdir;
      });

      return dirList;
    }//end listWebs

    this.setSrcPath = function(src){
      srcpath = src+":\\";
    }

    this.setTstPath = function(src){
      tstpath = src+":\\";
    }

    this.getSrcPath = function(){
      return srcpath;
    }

    this.getTstPath = function(){
      return tstpath;
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

    this.putWarningOnMain = function(path){
      var output = "";

      fs.readFile(srcpath+path+'/js/dist/main.min.js', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }

        data = data.concat("console.log('%c Atenção, Javascript compilado, alterar na masterpage o main path data-main=\"/js/dist/main.min\" para data-main=\"/js/main\"', 'background: #f00; color: #fff');");


        fs.writeFile(srcpath+path+'/js/dist/main.min.js', data, function(err) {
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

app.directive("tree", function(RecursionHelper, fileSrvc, compilerSrvc, $ionicScrollDelegate) {
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