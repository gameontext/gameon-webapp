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
  [            '$scope','$state','$log', 'API', 
    function (  $scope,  $state,  $log,   API) {
      
      // Login links
      $scope.api = API;
      
    }
  ]);