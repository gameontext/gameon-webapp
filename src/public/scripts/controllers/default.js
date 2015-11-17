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
  [            '$state','$log', 'API', 'user', 'auth',
    function (  $state,  $log,   API,   user,   auth) {

      // Login links
      this.api = API;

      // make the user & auth object persist across states.
      this.user = user;
      this.auth = auth;

      this.backToTheBeginning = function() {
          auth.logout(); // reset to try again
          $state.go('default');
      };
    }
  ]);
