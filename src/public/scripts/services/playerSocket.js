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
  [          '$websocket','$log','user','auth','API','playerSession', 'marked',
    function ($websocket,  $log,  user,  auth,  API,  playerSession, marked) {

      var ws;
      var websocketURL = API.WS_URL + user.profile._id + "?jwt="+auth.token();
      var id = 0;

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
      if ( user.profile.location !== clientState.roomId ) {
        gameData = {}; // start over
        delete clientState.bookmark;
        clientState.roomId = user.profile.location;
      }
      clientState.username = user.profile.name;

      // Create a v1 websocket
      $log.debug("Opening player socket %o for %o",websocketURL, user.profile);
      ws = $websocket(websocketURL, {
             useApplyAsync: true,
             reconnectIfNotNormalClose: true
           });

      // On open, check in with the concierge
      ws.onOpen(function() {
        console.log('connection open');
        ws.send('ready,' + angular.toJson(clientState, 0));
      });

      // On received message, push to the correct collection
      ws.onMessage(function(event) {
        $log.debug("OnMessage %o",event);

        var comma = event.data.indexOf(',');
        var command = event.data.slice(0,comma);
        var payload = event.data.slice(comma+1);
        var target, res;

        if ( "ack" === command ) {
          res = parseJson(payload);
          clientState.mediatorId = res.mediatorId;
          clientState.roomId = res.roomId;
          clientState.roomName = res.roomName;

          if ( !canSend ) {
            // indicate we can send again, and catch up with anything
            // we queued while the connection was re-establishing itself
            canSend = true;
            sendPending();
          }
        } else {
          comma = payload.indexOf(',');
          target = payload.slice(0,comma);
          payload = payload.slice(comma+1);

          res = parseJson(payload);
          clientState.bookmark = res.bookmark;
          clientState.fullName = res.fullName;
          res.id = id++; // this prevents element re-rendering in the UI

          if ( res.exits ) {
            gameData.exits = res.exits;
            $log.debug('exits updated', gameData);
          }
          if ( res.objects ) {
            res.roomInventory = res.objects;
          }
          if ( res.roomInventory ) {
            gameData.roomInventory = res.roomInventory;
            $log.debug('room inventory updated', gameData);
          }

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

      // On error, report the error, and close the connection
      // (try to reconnect)
      ws.onError(function(event) {
        $log.debug('connection Error', event);
      });

      // On close, update the player session,
      // and indicate that we can no longer send outbound messages
      ws.onClose(function(event) {
        $log.debug('connection closed', event);

        if ( canSend && !event.wasClean ) {
          $log.debug('error shut down');
        }
        canSend = false;

        playerSession.set('clientState', clientState);
        playerSession.set('gameData', gameData);
      });

      var logout = function() {
        clientState = {};
        gameData = {};
        ws.close();

        auth.logout(); // will also reset the session
      };

      var parseJson = function(message) {
        var res;
        try {
          res = angular.fromJson(message);
        } catch(e) {
          $log.debug('parse %o %o', message, e);
          res = {username: user.username, content: message};
        }

        $log.debug('parse message: %o %o', message, res);
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

      var send = function(message) {
        if ( canSend ) {
          var sendMsg;

          var output = {
            username: user.profile.name,
            userId: user.profile._id,
            content: message
          };

          if ( message.charAt(0) === '/') {
            // echo command to user's screen
            roomEvents.push({
              type: 'command',
              content: message,
              id: id++
              });

            // Handle special case for commands here while we have the pieces
            if ( message.indexOf('/sos') === 0 ) {
              sendMsg = "sos,*," + angular.toJson(output);

              $log.debug('sending message: %o', sendMsg);
              ws.send(sendMsg);
              // DONE/SENT!, return whether or not we can still send,
              // which is updated via onClose
              return canSend;
            } else if ( message.indexOf('/exits') === 0 ) {
              $log.debug('show cached exits: %o', gameData.exits);
              roomEvents.push({
                type: 'exits',
                content: gameData.exits,
                id: id++
                });
              // DONE/SENT!, return whether or not we can still send,
              // which is updated via onClose
              return canSend;
            }
          }

          sendMsg = "room,"+clientState.roomId+","+angular.toJson(output);

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
        send: send
      };

      return sharedApi;
    }
  ]);
