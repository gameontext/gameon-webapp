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
  [            '$state','API', 'user', 'auth',
    function (  $state,  API,   user,   auth) {

      // Login links
      this.api = API;

      // make the user & auth object persist across states.
      this.user = user;
      this.auth = auth;

      this.backToTheBeginning = function() {
        $state.go('default.logout');
      };

      this.showDummy = function() {
        if ( this.api.HOST === "gameontext.org" ) {
            return false;
        }
        return true;
      };
    }
  ]);
