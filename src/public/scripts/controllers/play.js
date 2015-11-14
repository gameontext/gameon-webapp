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
      this.startOver = false;
      this.roomEvents = playerSocket.roomEvents;
      this.playerSession = playerSocket.playerSession;

      this.me = function() {
        if ( !$state.is('play.me') ) {
          $state.go('play.me');
        }
      }

      this.updateProfile = function( ) {
          $log.debug('All done with our profile: %o %o', this.startOver, this.profileForm);

          if ( this.profileForm.$invalid ) {
            // bogus form data: don't go yet without correcting
          } else {
            user.update(this.startOver);

            this.startOver = false;
            $state.go('play.room')
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
