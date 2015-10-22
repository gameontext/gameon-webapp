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
  [          '$websocket','$log','user', 'auth', 'API',
    function ($websocket,  $log,  user,  auth, API) {
	  
	  if(typeof user.profile.id === 'undefined'){
		  $log.debug("Unable to build socket, as user has not been built correctly");
	  }else{
	      var q, ws;
	            
	      $log.debug("Opening player socket for %o",user.profile);
	      
	      var websocketURL = API.WS_URL + user.profile.id;
	     
	      // Collection for holding data: play.room.html displays
	      // this scrolling collection.
	      var roomEvents = [];
	      
	      // Create a v1 websocket
	      $log.debug('websocket %o', websocketURL);
	      ws = $websocket(websocketURL, { useApplyAsync: true } );

	      
	      //user is already loaded.. no need to do user.load. 
//	      q = user.load().then(function(response) {
//	        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);
//	
//	        // roomId must go here (last saved room)
//	        // successful response
//	        // fill in playerSession & username
//	        
//	        // OPEN WEBSOCKET HERE.
//	        
//	      }, function(response) {
//	        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);
//	
//	        // go to the sad room.. (Can't find the player information)
//	        // or back to the login/registration screen? or.. 
//	      });
	      
	                 
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
	        
	        if ( "ack" === command ) {
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
	          res = {'username': user.username, 'message': payload};
	        }
	        $log.debug('message: %o', res);
	        return res;
	      }
	      
	      var send = function(message) {
	        ws.send("room,"+playerSession.roomId+","+angular.toJson(message));
	      };
	      
	      // Available methods and structures
	      var sharedApi = {
	        roomEvents: roomEvents,
	        send: send
	      };
	
	      return sharedApi;
	  }
  }
  
  
  ]);
