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
  [            '$scope','$state','$log','auth', 
    function (  $scope,  $state,  $log,  auth ) {
      $log.debug('Loading default controller %o', $state);

      $scope.authenticate = function(provider) {
          if ( auth.oauth_authenticate(provider) ) {
            $state.go('play.room');
          }
          
          // TODO -- we need a sad state/page. :(
      };
      
    }
  ]);