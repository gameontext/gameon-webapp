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
  [          '$scope','$log','playerSocket','user','userAndAuth',
    function ($scope,  $log,  playerSocket,  user,  userAndAuth) {
      $log.debug('Starting play controller with %o and %o for ', user, playerSocket, user.profile.id);
      
      $scope.roomEvents = playerSocket.roomEvents;
      $scope.userInput = '';
      $scope.playerSession = playerSocket.playerSession;
      
      $scope.input = function(e) {
        if (e.keyCode === 13) {
          $scope.send();
        }
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
      }
  }]);
