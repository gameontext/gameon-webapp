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
  [            '$scope','$state','$log', 'API', 'user', 'auth',
    function (  $scope,  $state,  $log,   API,   user,   auth) {
      
      // Login links
      $scope.api = API;
      
      // make the user & auth object persist across states.
      $scope.user = user;      
      $scope.auth = auth
    }
  ]);