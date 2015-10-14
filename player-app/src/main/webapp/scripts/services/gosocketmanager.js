'use strict';

/**
 * @ngdoc service
 * @name playerApp.goSocketManager
 * @description
 * # goSocketManager
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('goSocketManager',
  [          '$websocket','$log'
    function ($websocket,  $log) {

    var ws = $websocket('ws://localhost:9081/ws');
    var collection = [];

    ws.onMessage(function(event) {
      console.log('message: ', event);
      var res;
      try {
        res = JSON.parse(event.data);
      } catch(e) {
        res = {'username': 'anonymous', 'message': event.data};
      }

      collection.push({
        username: res.username,
        content: res.message,
        timeStamp: event.timeStamp
      });
    });

    ws.onError(function(event) {
      console.log('connection Error', event);
    });

    ws.onClose(function(event) {
      console.log('connection closed', event);
    });

    ws.onOpen(function() {
      console.log('connection open');
      ws.send('Hello World');
      ws.send('again');
      ws.send('and again');
    });

    // Public API here
    return {
      collection: collection,
      status: function() {
        return ws.readyState;
      },
      send: function(message) {
        if (angular.isString(message)) {
          ws.send(message);
        }
        else if (angular.isObject(message)) {
          ws.send(JSON.stringify(message));
        }
      }
    };
});
