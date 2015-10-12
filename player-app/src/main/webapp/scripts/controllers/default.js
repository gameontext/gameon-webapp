'use strict';

/**
 * @ngdoc function
 * @name playerApp.controller:DefaultCtrl
 * @description
 * # DefaultCtrl
 * Controller of the playerApp
 */
angular.module('playerApp')
  .controller('DefaultCtrl', 
  [            '$scope','$stateParams','$state','$log', 
    function (  $scope,  $stateParams,  $state,  $log ) {
      $log.debug('Loading default controller %o', $state);

      $scope.authenticate = function(provider) {
          $log.debug('Authenticate using %o', provider);
          
          // TODO: Something here for real authentication
          $state.go('play.room');
      };
      
    }
  ]);