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
  [            '$scope','$state','$log','auth','API','user', 
    function (  $scope,  $state,  $log,  auth,  API,  user ) {
      
      // Login links
      $scope.api = API;

      // Display/retrieve user information (link to user service)
      $scope.user = user;
      
      $scope.authenticate = function(auth) {
        $log.debug("THIS IS FAKE AUTH!!! You may pass");
        $state.go('play.room');
      };
      
    }
  ]);