angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, fileSrvc) {

  $ionicModal.fromTemplateUrl('settings.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.settingsModal = modal;
  });

  $scope.dsvDrive = fileSrvc.getSrcPath();
  $scope.tstDrive = fileSrvc.getTstPath();

  $scope.$watch('dsvDrive', function(newValue){
    console.log("new dsvDrive name: "+fileSrvc.getSrcPath());
    $scope.dsvDrive = String($scope.dsvDrive).replace(':\\', '');
  });

  $scope.$watch('tstDrive', function(newValue){
    console.log("new tstDrive name: "+fileSrvc.getTstPath());
    $scope.tstDrive = String($scope.tstDrive).replace(':\\', '');
  });
  
  $scope.showSettings = function(){
    $scope.settingsModal.show();
  }
  $scope.hideSettings = function(){
    $scope.settingsModal.hide();
  }
  $scope.fieldBlur = function(childScope, driveToken){

    if(driveToken == "dsv"){
      $scope.dsvDrive = childScope.dsvDrive;
      fileSrvc.setSrcPath($scope.dsvDrive);
    }

    if(driveToken == "tst"){
      $scope.tstDrive = childScope.tstDrive;
      fileSrvc.setTstPath($scope.tstDrive);
    }
  }

  $scope.$on('$routeChangeSuccess', function(e, current, previous){

    console.log(current);

  });

})

.controller('TreeView', function($scope, $stateParams, $sce, $ionicModal, fileSrvc, $ionicScrollDelegate, $stateParams) {


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
  $scope.currDrive = $stateParams.drive;

  /*
  var grunt = require('grunt');

  grunt.registerTask('default', 'Log some stuff.', function() {
      console.log('stuff');
  });
*/

  $scope.$watch('searchText', function(){
    $ionicScrollDelegate.resize();
  });

  /*
    $scope.$watch(function(){
      return fileSrvc.getSrcPath();
    }, function(newValue){
      listWebs();
    });
  */

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

        console.log(command);

        //If we are trying to run a command in TST we set the drive letter
        command = (arguments[3]) ? command + ' --drive=' + $scope.tstDrive : command;

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

          //If we do a concat job we put a warning on the main.min file
          if(proj == 'angular-concat'){
            fileSrvc.putWarningOnMain(web); 
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
    $scope.dirList = fileSrvc.listWebs($scope.currDrive);
  }//end listWebs

  //list inital folders
  listWebs();

});