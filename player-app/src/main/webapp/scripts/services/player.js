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
      var playerURL = API.PROFILE_URL + 'wasdev'
      var websocketURL = API.WS_URL + 'wasdev'

      var parameters = {};
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

      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

      });
                 
      // On open, check in with the concierge
      ws.onOpen(function() {
        console.log('connection open');
        ws.send('ready,' + angular.toJson(playerSession, 0));
      });

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
      
      var sharedApi = {
          roomEvents: roomEvents,
      };

      return sharedApi;
  }]);
