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
  [            '$state','$log', '$http', 'API', 'user', 'auth',
    function (  $state,  $log,   $http,   API,   user,   auth) {

      // Login links
      this.api = API;

      // make the user & auth object persist across states.
      this.user = user;
      this.auth = auth;

      this.userLogin = {};

      this.backToTheBeginning = function() {
          auth.logout(); // reset to try again
          $state.go('default');
      };

      this.login = function() {
          $log.debug('login called to %o by %o', this.api.REDHAT, this.loginForm, this.userLogin);

          $http({
            method : 'POST',
            url : this.api.REDHAT,
            cache : false,
            data : this.userLogin
          }).then(function(response) {
            $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
            $state.go('default.yuk');
          }, function(response) {
            $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
            $state.go('default.yuk');
          }).catch(console.log.bind(console));
      }
    }
  ]);
