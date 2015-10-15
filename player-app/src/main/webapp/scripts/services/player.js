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
  [          '$websocket','$log',
    function ($websocket,  $log) {

      // Create websocket
      var ws = $websocket('ws://localhost:9081/ws');
      $log.debug('websocket %o', ws);
                 
      // Create a collection for holding data
      var roomEvents = [];

      // On received message, push to the correct collection 
      ws.onMessage(function(event) {
        $log.debug('message: ', event);
        var res;
        try {
          res = JSON.parse(event.data);
        } catch(e) {
          res = {'username': 'anonymous', 'message': event.data};
        }

        roomEvents.push({
          username: res.username,
          content: res.message,
          timeStamp: event.timeStamp
        });
      });

      // On error, report the error, and close the connection 
      // (try to reconnect)
      ws.onError(function(event) {
        console.log('connection Error', event);
      });

      // On close, close gracefully
      ws.onClose(function(event) {
        console.log('connection closed', event);
      });

      ws.onOpen(function() {
        console.log('connection open');
        ws.send('Hello World');
        ws.send('again');
        ws.send('and again');
      });

      var methods = {
          roomEvents: roomEvents,
          get: function() {
            dataStream.send(JSON.stringify({ action: 'get' }));
          }
        };

      return methods;
  }]);
