'use strict';

/**
 * This wraps interaction between the client device and the server-side Player
 * service. The Player service is the Player's view of the world, and the
 * websocket between the client and this player-focused hub service should
 * contain most of the back and forth required for interacting with the
 * game (room/chat, inventory), and the leaderboard (storing/retrieving
 * earned trophies and badges).
 *
 * @ngdoc service
 * @name playerApp.playerSocket
 * @description
 * # playerSocket
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('playerSocket',
  [          '$rootScope','$websocket','$log','user','auth','API','playerSession','marked','ga',
    function ($rootScope,  $websocket,  $log,  user,  auth,  API,  playerSession,  marked,  ga) {

      var ws;
      var id = 0;
      var retryCount = 0;
      var pingCount = 0;
      var lastPauseId = 0;

      function userActive() {
        return pingCount < 150;
      }

      // There is no way to add additional HTTP headers to the outbound
      // WebSocket -- the token needs to remain in the query string.
      var websocketURL = API.WS_URL + user.profile._id  + "?jwt=" + auth.token();

      // Collection for holding data: play.room.html displays
      // this scrolling collection.
      var roomEvents = [];

      // Collection of messages pending send
      var pendingSend = [];

      // Status of socket: available to send or not
      var canSend = false;

      // Restore some information from the session, like the bookmark (last seen message)
      var clientState = angular.extend({}, playerSession.get('clientState'));

      // More cached data: exits, inventory, etc.
      var gameData = angular.extend({}, playerSession.get('gameData'));

      // Clear the bookmark if the DB says we're in a different room than the local session does.
      if ( user.profile.hasOwnProperty('location') && user.profile.location.location !== clientState.roomId ) {
        $log.debug('cache cleared');
        gameData = {}; // start over
        clientState.fullName = "Unknown";

        if(user.profile.location.location === null) {
          delete clientState.roomId;
        } else {
          clientState.roomId = user.profile.location.location;
        }
        delete clientState.bookmark;
        delete clientState.roomName;
      }

      clientState.username = user.profile.name;

      // Create a v1 websocket
      $log.debug("Opening player socket %o for %o",websocketURL, user.profile);
      ws = $websocket(websocketURL, {
             useApplyAsync: true
           });

      // On open
      ws.onOpen(function() {
        console.log('CONNECTED / READY: sending %o', clientState);
        ga.report('send','event','GameOn','Socket','open');
        ga.report('send','event','Room','Switch',clientState.roomId);
        ws.send('ready,' + angular.toJson(clientState, 0));

        // If the user was active in the previous session, clear the
        // retry count:
        if ( userActive() )
          retryCount = 0;

        console.log('open session state: retryCount=%o pingCount=%o', retryCount, pingCount);
      });

      // On received message, push to the correct collection
      ws.onMessage(function(event) {

        var comma = event.data.indexOf(',');
        var command = event.data.slice(0,comma);
        var payload = event.data.slice(comma+1);
        var target, res;

        $log.debug("OnMessage %o %o %o", pingCount, command, payload);

        if ( "ack" === command ) {
          // ack,{json}

          res = parseJson(payload);

          if ( res.hasOwnProperty('playerUpdate') ) {
            ga.report('send','event','GameOn','Socket','playerUpdate');
            user.load(user.profile._id, user.profile.name);
          } else {
            clientState.mediatorId = res.mediatorId;

            if ( clientState.roomId != res.roomId ) {
              $log.debug("OnMessage ACK switch rooms %o", res);

              // Full reset, switch rooms
              clientState.roomId = res.roomId;
              clientState.roomName = res.name;

              ga.report('send','event','GameOn','Socket','roomSwitch');

              if (res.fullName){
                clientState.fullName = res.fullName;
              } else {
                clientState.fullName = res.name;
              }
            }

            // Update game data w/ ack (might be a room switch)
            updateGameData(gameData, res, clientState.roomId != res.roomId)

            // Update saved session data
            playerSession.set('clientState', clientState);
            playerSession.set('gameData', gameData);

            if ( !canSend ) {
              // indicate we can send again, and catch up with anything
              // we queued while the connection was re-establishing itself
              canSend = true;
              sendPending();
            }
          }
        } else if ( "ping" === command ) {
           // count pings
           pingCount++;
           if ( !userActive() ) {
             pause('This session has been paused', true);
           }
        } else {
          // player,id,{json}

          comma = payload.indexOf(',');
          target = payload.slice(0,comma);
          payload = payload.slice(comma+1);

          res = parseJson(payload);
          clientState.bookmark = res.bookmark;
          res.id = id++; // this prevents element re-rendering in the UI

          if ( res.fullName ) {
            clientState.fullName = res.fullName;
          }

          // update game data (not a room switch)
          updateGameData(gameData, res, false);

          playerSession.set('gameData', gameData);

          switch (res.type) {
            case 'event':
              if ( res.content[user.profile._id] ) {
                res.content = marked(res.content[user.profile._id] || '');
              } else {
                res.content = marked(res.content['*'] || '');
              }
              roomEvents.push(res);
              break;
            default:
              res.description = marked(res.description || '');
              roomEvents.push(res);
              break;
          }
        }
      });

      // On error, report the error, and close or retry the connection
      ws.onError(function(event) {
        $log.debug('connection Error', event);
      });

      // On close, update the player session,
      // and indicate that we can no longer send outbound messages
      ws.onClose(function(event) {
        $log.debug('connection closed: %o %o', event.code, event);
        ga.report('send','event','GameOn','Socket','close');
        canSend = false;

        playerSession.set('clientState', clientState);
        playerSession.set('gameData', gameData);

        if ( event.code === 1008 ) {
          $log.debug('WEBSOCKET POLICY CLOSE', event);
          pause("Paused due to expired session. Please [log in again](/#/login) to play.", false);
          $rootScope.$apply(); // process addition to array, not a usual render loop

        } else if ( event.code != 1000 ) {
          retryCount++;

          if ( userActive() && retryCount <= 5 ) {
            $log.debug('error shut down, retry %o', retryCount);
            ws.reconnect();
          } else {
            pause("Paused after 5 attempts. Press the button when ready to try again", true);
            $rootScope.$apply(); // process addition to array, not a usual render loop
          }
        }
      });

      function updateGameData(data, updates, roomSwitch) {
        $log.debug("updateGameData switch=%o: %o -> %o", roomSwitch, updates, data);

        if ( updates.objects ) {
          updates.roomInventory = updates.objects;
        }

        if ( updates.roomInventory ) {
          data.roomInventory = updates.roomInventory;
          $log.debug('room inventory updated', data.roomInventory);
        }

        if ( roomSwitch ) {
          if ( updates.exits ) {
            data.exits = updates.exits;
            $log.debug('exits updated', data.exits);
          } else {
            data.exits = {};
          }

          if ( updates.commands ){
            data.commands = updates.commands;
            $log.debug('commands updated', data.commands);
          } else {
            data.commands = {};
          }
        } else {
          // Update / confirmation of SOME values
          // Rooms must be able to update/revise some things..
          if ( updates.exits ) {
            data.exits = angular.extend({}, data.exits, updates.exits);
            $log.debug('exits updated', data.exits);
          }

          if ( updates.commands ){
            data.commands = angular.extend({}, data.commands, updates.commands);
            $log.debug('commands updated', data.commands);
          }
        }
      }

      var logout = function() {
        clientState = {};
        gameData = {};
        ws.close();
        ga.report('send','event','GameOn','Socket','logout');
        auth.logout(); // will also reset the session
      };

      var pause = function(message, button) {
        lastPauseId = id++;
        roomEvents.push({
          type: 'paused',
          content: message,
          button: button,
          id: lastPauseId
        });

        $log.debug('PAUSE %o %o', message, button);
        ws.close();
      }

      var resume = function(id) {
        if ( id <= 0 )
          return;

        retryCount = 0;
        lastPauseId = 0;
        ws.reconnect();
        for (var i = roomEvents.length - 1; i >= 0; --i) {
          $log.debug('i %o: %o', i, roomEvents[i]);
          if ( roomEvents[i].id === id ) {
            $log.debug('RESULT: %o', roomEvents[i]);
            roomEvents[i].button = false;
            roomEvents[i].content = 'Session resumed.'
            break;
          }
        }
      }

      var parseJson = function(message) {
        var res;
        try {
          res = angular.fromJson(message);
        } catch(e) {
          $log.debug('parse %o %o', message, e);
          res = {username: user.username, content: message};
        }

        return res;
      };

      var trySend = function(element) {
          // CARE! 'this' is the value passed from sendPending for iterating over
          // all pending elements (array.every), it is not playerSocket.
          if ( send(element) ) {
            this.i++;
            return true;
          }
          return false;
      };

      var sendPending = function() {
        var howfar = { i: 0 };

        // Iterate through the pending messages, stopping if the connection
        // is closed again *sigh*
        pendingSend.every(trySend, howfar);

        $log.debug('CATCH UP: pendingSend.length = %o, sent %o', pendingSend.length, howfar.i);
        pendingSend.splice(0, howfar.i);
      };

      var listExits = function() {
        // echo command to user's screen
        roomEvents.push({
          type: 'command',
          content: '/exits',
          id: id++
        });

        $log.debug('show cached exits: %o', gameData.exits);
        roomEvents.push({
          type: 'exits',
          content: gameData.exits,
          id: id++
        });

      };

      var listCommands = function() {
        roomEvents.push({
          type: 'command',
          content: '/help',
          id: id++
        });

        $log.debug('show cached commands: %o', gameData.commands);
        roomEvents.push({
          type: 'commands',
          content: gameData.commands,
          id: id++
        });
      };

      var send = function(message) {
        if ( message.charAt(0) === '/') {
          // echo command to user's screen
          roomEvents.push({
            type: 'command',
            content: message,
            id: id++
            });
        }

        if ( message.indexOf('/exits') === 0 ) {
            $log.debug('show cached exits: %o', gameData.exits);
            ga.report('send','event','GameOn','Socket','/exits');
            roomEvents.push({
              type: 'exits',
              content: gameData.exits,
              id: id++
              });
            // DONE/SENT!, return whether or not we can still send,
            // which is updated via onClose
        } else if (message.indexOf('/help') === 0 ) {
            $log.debug('show cached commands: %o', gameData.commands);
            ga.report('send','event','GameOn','Socket','/help');
            roomEvents.push({
              type: 'commands',
              content: gameData.commands,
              id: id++
            });
            // DONE/SENT!, return whether or not we can still send,
            // which is updated via onClose
        } else if (message.indexOf('/pause') === 0 ) {
          pause('This session has been paused', true);
        } else if (message.indexOf('/resume') === 0 ) {
          resume(lastPauseId);
        } else if ( canSend ) {
          var sendMsg;
          var output = {
            username: user.profile.name,
            userId: user.profile._id,
            content: message
          };

          if ( message.indexOf('/sos') === 0 ) {
            ga.report('send','event','GameOn','Socket','/sos');
            sendMsg = "sos,*," + angular.toJson(output);
          } else {
            sendMsg = "room,"+clientState.roomId+","+angular.toJson(output);
            pingCount = 0; // clear ping count with user activity
          }

          $log.debug('sending message: %o', sendMsg);
          ws.send(sendMsg);
        } else {
          pendingSend.push(message);
          $log.debug('Not able to send at the moment. Pushing message to pending list (%o): %o', pendingSend.length, message);
        }

        // return whether or not we can still send
        return canSend;
      };

      // Available methods and structures
      var sharedApi = {
        roomEvents: roomEvents,
        clientState: clientState,
        gameData: gameData,
        logout: logout,
        listExits: listExits,
        listCommands: listCommands,
        send: send,
        pause: pause,
        resume: resume
      };

      return sharedApi;
    }
  ]);
