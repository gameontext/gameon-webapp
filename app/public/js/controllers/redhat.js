'use strict';

/**
 * @ngdoc function
 * @name playerApp.controller:RedHatCtrl
 * @description
 * # RedHatCtrl
 * Controller of the playerApp
 */
angular.module('playerApp')
  .controller('RedHatCtrl',
  [            '$state','API', 'user', 'auth',
    function (  $state,  API,   user,   auth) {

      // Login links
      this.api = API;

      // make the user & auth object persist across states.
      this.user = user;
      this.auth = auth;

      this.backToTheBeginning = function() {
        $state.go('logout');
      };
    }
  ]);
