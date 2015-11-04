'use strict';

/**
 * @ngdoc function
 * @name playerApp.controller:PlayCtrl
 * @description
 * # PlayCtrl
 * Controller of the playerApp
 */
angular.module('playerApp')
  .controller('PlayCtrl', 
  [          '$scope','$log','playerSocket','user','userAndAuth','$window',
    function ($scope,  $log,  playerSocket,  user,  userAndAuth,  $window) {
      $log.debug('Starting play controller with %o and %o for ', user, playerSocket, user.profile.id);
      
      var inputBox = $window.document.getElementById('inputbox');
      
      $scope.roomEvents = playerSocket.roomEvents;
      $scope.userInput = '';
      $scope.playerSession = playerSocket.playerSession;
      
      $scope.input = function(e) {
        if (e.keyCode === 13) {
          $scope.send();
        }
      };
      
      $scope.fillin = function(input) {
        $scope.userInput = input;
        inputBox.focus();
      };
      
      $scope.send = function() {
        var input = $scope.userInput;
        $scope.userInput = '';
        if ( input ) {
          playerSocket.send(input);
        }
      };
      
      $scope.sendFixed = function(input) {
        playerSocket.send(input);
        inputBox.focus();
      };
  }]);
