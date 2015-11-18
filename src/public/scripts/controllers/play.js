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
  [          '$state','$log','playerSocket','user','userAndAuth','$window',
    function ($state,  $log,  playerSocket,  user,  userAndAuth,  $window) {
      $log.debug('Starting play controller with %o and %o for ', user, playerSocket, user.profile.id);

      var inputBox = $window.document.getElementById('inputbox');

      this.user = user;
      this.userInput = '';
      this.roomEvents = playerSocket.roomEvents;
      this.playerSession = playerSocket.playerSession;

      this.restart = function() {
        this.sendFixed('/sos-restart');
        $state.go('play.room');
      };

      this.logout = function() {
        playerSocket.logout();
        $state.go('default');
      };

      this.updateProfile = function( ) {
          if ( this.profileForm.$invalid ) {
            // bogus form data: don't go yet without correcting
          } else {
            user.update();
            $state.go('play.room');
          }
      };

      this.input = function(e) {
        if (e.keyCode === 13) {
          this.send();
        }
      };

      this.append = function(input) {
          this.userInput += ' ' + input;
          inputBox.focus();
      };

      this.fillin = function(input) {
        this.userInput = input;
        inputBox.focus();
      };

      this.send = function() {
        var input = this.userInput;
        this.userInput = '';
        if ( input ) {
          playerSocket.send(input);
        }
      };

      this.sendFixed = function(input) {
        playerSocket.send(input);
        inputBox.focus();
      };
  }]);
