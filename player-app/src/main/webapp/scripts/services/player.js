'use strict';

/**
 * This is the PlayerService -- it wraps interaction between this
 * (effectively the PlayerClient) and the server side. The Player service
 * is the Player's view of the world, and the websocket between the client
 * and this player-focused hub service should encapsulate much of the back
 * and forth required for interacting with rooms (room/chat, inventory), 
 * and the leaderboard (storing/retrieving earned trophies and badges). 
 * 
 * The Player Client & Service track where the player is (what room), 
 * and other player-centric information (username/handle, linked social ids, etc.).
 * 
 * @ngdoc service
 * @name playerApp.playerService
 * @description
 * # playerService
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('playerService',
  [          '$websocket','$log','$http','auth','API',
    function ($websocket,  $log,  $http,  auth,  API) {
      var q, ws;

      // Create a collection for holding data
      var roomEvents = [];
      
      // TODO: need username to query... 
      var playerURL = API.PROFILE_URL + 'wasdev';
      var websocketURL = API.WS_URL + 'wasdev';

      var parameters = {};
      
      // username should come from the id
      var username = 'anonymous';
      
      // Information about the player retrieved from the HTTP request
      var playerSession = {};

      // Create a v1 websocket
      $log.debug('websocket %o', websocketURL);
      ws = $websocket(websocketURL);
      
      // Fetch data about the user
      $log.debug('fetch data from %o', playerURL);
      q = $http({
          method : 'GET',
          url : playerURL,
          cache : false,
          params : parameters
      }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

          // roomId must go here (last saved room)
          // successful response
          // fill in playerSession & username
          // OPEN WEBSOCKET HERE.
          
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

        // go to the sad room.. (Can't find the player information)
        // or back to the login/registration screen? or.. 
      });
                 
      // On open, check in with the concierge
      ws.onOpen(function() {
        console.log('connection open');
        ws.send('ready,' + angular.toJson(playerSession, 0));
      });

      // On received message, push to the correct collection 
      ws.onMessage(function(event) {
        
        var comma = event.data.indexOf(',');
        var command = event.data.slice(0,comma);
        var payload = event.data.slice(comma+1);
        var res;
        
        if ( "ack" == command ) {
          res = parseJson(payload);
          playerSession.mediatorId = res.mediatorId;
          playerSession.roomId = res.roomId;
        } else {
          comma = payload.indexOf(',');
          payload = payload.slice(comma+1);
          res = parseJson(payload);
          
          switch (res.type) {
            case 'chat':
              roomEvents.push({
                type: res.type,
                username: res.username,
                content: res.content,
                timeStamp: event.timeStamp
              });
              break;
            case 'event':
              roomEvents.push({
                type: res.type,
                content: res.content,
                timeStamp: event.timeStamp
              });
              break;
            case 'exit':
              break;
            case 'location':
              break;
          }
        }

      });

      // On error, report the error, and close the connection 
      // (try to reconnect)
      ws.onError(function(event) {
        $log.debug('connection Error', event);
      });

      // On close, close gracefully
      ws.onClose(function(event) {
        $log.debug('connection closed', event);
      });
      
      var parseJson = function(message) {
        var res;
        try {
          res = JSON.parse(message);
        } catch(e) {
          res = {'username': username, 'message': payload};
        }
        $log.debug('message: %o', res);
        return res;
      }
      
      var send = function(message) {
        ws.send("room,"+playerSession.roomId+","+angular.toJson(message));
      };
      
      var sharedApi = {
        username: username,
        roomEvents: roomEvents,
        send: send
      };

      return sharedApi;
  }]);
