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
  }]);