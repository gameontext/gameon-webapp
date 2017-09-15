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
  [          '$state','$log','playerSocket','user','auth', 'map', 'commandHistory', 'userAndAuth','$window', 'marked',
    function ($state,  $log,  playerSocket,  user,  auth,   map,   commandHistory,   userAndAuth,  $window,   marked) {
      $log.debug('Starting play controller with %o and %o for ', user, playerSocket, user.profile.id);

      function setCaretPos(elm, pos) {
        setTimeout(function() {
          // this works in any non-ancient browser,
          // though it needs to run on a timeout
          // for chrome.
          elm.setSelectionRange(pos, pos);
        }, 0);
      }

      var inputBox = $window.document.getElementById('inputbox');
      inputBox.focus();

      this.user = user;
      this.auth = auth;
      this.map  = map;
      this.glued = true;
      this.userInput = '';
      this.roomEvents = playerSocket.roomEvents;
      this.clientState = playerSocket.clientState;
      this.fixKeyboard = "";

      this.pause = function() {
        $log.debug('PAUSE!!');
        playerSocket.pause('This session has been paused', true);
      };

      this.resume = function(id) {
        $log.debug('RESUME!! %o', id);
        playerSocket.resume(id);
      };

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
            this.clientState.username = user.profile.name;
            $state.go('play.room');
          }
      };

      this.updateSharedSecret = function( ) {
        user.updateSharedSecret();
      };

      this.createConnectionSecret = function( ) {
        var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var i;
        var result = "";
        var length = 32;
        if($window.crypto && $window.crypto.getRandomValues) {
          var values = new Uint32Array(length);
          $window.crypto.getRandomValues(values);
          for(i=0; i < length; i++) {
              result += charset[values[i] % charset.length];
          }
          return result;
        } else {
          for(i=0; i<length; i++) {
            result += charset[Math.floor(Math.random()*charset.length)];
          }
          return result;
        }
      };

      this.doorName = function(direction) {
          switch(direction) {
              case 'N': return '<span class="full">(N)orth</span><span class="short">N</span>';
              case 'S': return '<span class="full">(S)outh</span><span class="short">S</span>';
              case 'E': return '<span class="full">(E)ast</span><span class="short">E</span>';
              case 'W': return '<span class="full">(W)est</span><span class="short">W</span>';
              case 'U': return '<span class="full">(U)p</span><span class="short">U</span>';
              case 'D': return '<span class="full">(D)own</span><span class="short">D</span>';
              default: return '';
          }
      };

      this.currentPrefix = null;

      this.capturePrefix = function() {
        if (this.currentPrefix === null) {
          this.currentPrefix = this.userInput;
        }
      };

      this.releasePrefix = function() {
        this.currentPrefix = null;
        commandHistory.reset();
      };

      this.handleHistoryKey = function(historyAction, onNull) {
        this.capturePrefix();
        var cmd = historyAction(this.currentPrefix);

        if (cmd !== null) {
          this.userInput = cmd;
        } else {
          if (onNull) {
            this.onNull();
          }
        }
        setCaretPos(inputBox, this.userInput.length);
      };

      this.handleUp = function() {
        this.handleHistoryKey(commandHistory.prev);
      };

      this.handleDown = function() {
        this.handleHistoryKey(commandHistory.next, function() {
          this.userInput = this.currentPrefix;
        });
      };

      this.input = function(e) {
        if (e.keyCode === 13) {
          commandHistory.push(this.userInput);
          this.releasePrefix();
          this.send();
          inputBox.focus();
        }
      };

      this.inputKeyDown = function(e) {
        switch (e.keyCode) {
          case 38:
            this.handleUp();
            break;
          case 40:
            this.handleDown();
            break;
          case 37:
          case 39:
            // left/right should not release prefix
            break;
          default:
            //$log.debug("key down " + e.keyCode);
            this.releasePrefix();
            break;
        }
      };

      this.inputFocus = function() {
        this.fixKeyboard = "phonekeyboard";
      };

      this.inputBlur = function() {
        this.fixKeyboard = "";
      };

      this.append = function(input) {
        this.userInput += ' ' + input;
        inputBox.focus();
      };

      this.fillin = function(input) {
        $log.debug('replace value of input box ', input);

        this.userInput = input;
        inputBox.focus();
      };

      this.listExits = function() {
        playerSocket.listExits();
      };

      this.listCommands = function() {
        playerSocket.listCommands();
      };

      this.send = function() {
        var input = this.userInput;
        this.userInput = '';
        if ( input ) {
          playerSocket.send(input);
          inputBox.focus();
        }
      };

      this.sendFixed = function(input) {
        playerSocket.send(input);
      };

      this.marked = function(input){
        return marked(input || '');
      };
}]);
