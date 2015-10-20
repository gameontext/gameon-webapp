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
  [          '$scope','$log','playerService',
    function ($scope,  $log,  playerService) {
      $log.debug('Player service created with %o', playerService);
      
      $scope.playerService = playerService;
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
          var message = {'username': $scope.playerService.username, 'content': input};
          playerService.send(message);
        }
      };
  }]);