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
  [          '$scope','$log','playerSocket','user',
    function ($scope,  $log,  playerSocket,  user) {
      $log.debug('Starting play controller with %o and %o for ', user, playerSocket, user.profile.id);
      
      $scope.roomEvents = playerSocket.roomEvents;
      $scope.userInput = '';
      
      $scope.input = function(e) {
        if (e.keyCode === 13) {
          $scope.send();
        }
      };
      
      $scope.send = function() {
        var input = $scope.userInput;
        $scope.userInput = '';
        if ( input ) {
          var message = {'username': user.username, 'content': input};
          playerSocket.send(message);
        }
      };
  }]);