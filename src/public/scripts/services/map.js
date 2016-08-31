/*******************************************************************************
 * Copyright (c) 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

'use strict';

/**
* Control interractions with the map service on /map/v?/sites
*
* @ngdoc service
* @name playerApp.map
* @description
* # user
* Factory in the playerApp.
*/
angular.module('playerApp')
 .factory('map',
 [          '$log','$state','API','$http','user',
   function ($log,  $state,  API,  $http,  user) {
     console.log("Loading MAP");

     var mapurl = '/map/v1/sites';  //where to get the data from

     //convert all the values for inputs that startswith into a JSON object, with an optional default value if missing
     function inputToJSON(startswith, defvalue) {
       	var json = {};
       	if(!defvalue) {
       		defvalue = '';
       	}
        var nodes = document.querySelectorAll('input[id^=' + startswith +']');
        angular.forEach(nodes, function(node) {
          var name = node.id.substring(startswith.length);
          json[name] = node.value || defvalue;
        });
        console.log("MAP : JSON = " + JSON.stringify(json));
        return json;
     }

   //convert the flat JSON from the form into a room JSON object
   function adaptToRoom(data) {
    	var room = {
    		"name" : data.name,
    		"fullName" : data.fullName,
    		"description" : data.description,
    		"doors" : {
    			"u" : data.u,
    			"d" : data.d,
    			"n" : data.n,
    			"e" : data.e,
    			"s" : data.s,
    			"w" : data.w
     		},
     		"connectionDetails" : {
     			"type" : "websocket",
     			"target" : data.target
     		}
    	};
    	return room;
    }

    //pads a numeric value with additional zeros
    function pad(value) {
      return value < 10 ? '0' + value : value;
    }

    //return the current time as a UTC date/time stamp
    function now() {
      var d = new Date();
      //UTC = 2015-03-25T12:00:00
      var utcd = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
      utcd += 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
      utcd += '.000Z';
      return utcd;
    }

    //create a valid hmac to send to the GameOn servers
    function hmac(id, secret, date, bodyHash) {
      var mac = new KJUR.crypto.Mac({"alg": "HmacSHA256", "pass": toUTF8(secret)});
      var headers = "";  //this would be the hash of any game on headers
      var params = "";  //this would be the hash of any query string parameters

      //send in old style
      //mac.updateString(toUTF8("POST"));
      //mac.updateString(toUTF8("/map/v1/sites"));
      mac.updateString(toUTF8(id));
      mac.updateString(toUTF8(date));
      mac.updateString(toUTF8(headers));
      mac.updateString(toUTF8(params));
      var hmac = mac.doFinalString(toUTF8(bodyHash));
      console.log('HMAC : ' + hmac);
      hmac = btoa(hexToString(hmac));
      console.log('Base64 : ' + hmac);
      return hmac;
    }

    function toUTF8(str) {
    	return unescape(encodeURIComponent(str)); //convert from UTF16 -> UTF8
    }

    //construct a SHA256 hash of the supplied value
    function hash(value) {
      var md = new KJUR.crypto.MessageDigest({"alg": "sha256", "prov": "cryptojs"});
      var utf8 = unescape(encodeURIComponent(value)); //convert from UTF16 -> UTF8
      md.updateString(utf8);
      var hash = md.digest();
      console.log('Hash : ' + hash);
      hash = btoa(hexToString(hash));
      console.log('Base64 : ' + hash);
      return hash;
    }

    //convert a hex string into characters
    function hexToString(hex) {
        var result = '';
        for (var i = 0; i < hex.length; i += 2) {
            var val = hex.substr(i, 2);
            result += String.fromCharCode(parseInt(val, 16));
        }
        return result;
    }

    return {
         mapurl: mapurl,
         hexToString: hexToString,
         inputToJSON: inputToJSON,
         hash: hash,
         hmac: hmac,
         now: now,
         adaptToRoom: adaptToRoom
     };

   }
 ]
);

angular.module('playerApp')
.controller('sitesCtrl', ['$scope', '$http', 'user', 'map', function($scope, $http, user, map) {

  console.log("MAP : controller 'sitesCtrl'");

  //var mapurl = '/map/v1/sites';  //where to get the data from
  $scope.sites = []; //list of rooms registered to this ID
  $scope.activeSite = {};
  $scope.activeSiteId = "";

  $scope.getSitesForUser = function() {
    console.log("MAP : Getting list of rooms for user : " + user.profile._id);
    $http({
      method: 'GET',
      url: map.mapurl
    }).success(function(data) {
      //need to filter out rooms that are not associated with this user
      console.log("MAP : filtering registered rooms");
      $scope.sites = [];
      angular.forEach(data, function(site) {
        console.log("MAP : checking " + JSON.stringify(site.owner));
        if(site.owner == user.profile._id) {
          console.log("MAP : found room - " + site._id);
          $scope.sites.push(site);
          if($scope.activeSiteId == "") {
            $scope.activeSiteId = site._id; //set the active site to the first one if not already set
            $scope.activeSite = site;
          }
        }
      });
      console.log("MAP : site list = " + JSON.stringify($scope.sites));
      console.log("MAP : active site = " + JSON.stringify($scope.activeSite));
      console.log("MAP : active site ID = " + $scope.activeSiteId);
    });
  }

  $scope.reset = function() {
    console.log("MAP : changing active site selection to " + $scope.activeSiteId);
    for(var i = 0; i < $scope.sites.length; i++) {
      if($scope.sites[i]._id == $scope.activeSiteId) {
        $scope.activeSite = $scope.sites[i];
        return; //quit out as found site to set
      }
    }
    console.log("MAP : resetting active selection to blank");
    $scope.activeSite = {};
    $scope.activeSiteId = "";
  }

  $scope.optionStyle = {
    color: '#000000'
  };

  //register or update a specified room
  function registerOrUpdate(room, roomid) {
     var date = map.now();
     var body = JSON.stringify(room).trim();
     var bodyHash = map.hash(body);
     var gid = user.profile._id;
     var secret = user.profile.credentials.sharedSecret;
     var sig = map.hmac(gid, secret, date, bodyHash);
     var verb = roomid ? 'PUT' : 'POST';
     var endpoint = roomid ? map.mapurl + '/' + roomid : map.mapurl;

     $http({
         url: endpoint,
         method: verb,
         headers: {  'gameon-id': gid,
                     'gameon-date': date,
                     'gameon-sig-body': bodyHash,
                     'gameon-signature': sig,
                     'contentType': 'application/json', //what is being sent to the server
         },
         data: body
       }).then(function (response) {
                     alert('register/update successful : response from server : ' + response.status);
                     console.log("MAP : response " + JSON.stringify(response.data));
                     if(!roomid) { //a new room was created, add to list and set as selected
                       var site = response.data;
                       $scope.sites.push(response.data);
                       $scope.activeSiteId = site._id; //set the active site to the first one if not already set
                       $scope.activeSite = site;
                     }
                 },
               function (response) {
                     alert('Unable to register/update room : response from server : ' + response.data + ':' + response.status);
                 }
     );

  }

   $scope.createRoom = function() {
     console.log("MAP : creating new room");
     var data = map.inputToJSON("roomInfo_", "unknown");
     var room = map.adaptToRoom(data);
     console.log("MAP : registering room - " + JSON.stringify(room));
     registerOrUpdate(room);
   }

   $scope.updateRoom = function(id) {
     console.log("MAP : updating existing room : " + id);
     var data = map.inputToJSON("roomInfo_", "unknown");
     var room = map.adaptToRoom(data);
     registerOrUpdate(room, id);
   }

   $scope.deleteRoom = function remove(siteid) {
     //var siteid = document.getElementById("roomInfo_id").value;
     var gid = user.profile._id;
     var secret = user.profile.credentials.sharedSecret;
     console.log("MAP : deleting room " + siteid);
     var date = map.now();
      var sig = map.hmac(gid, secret, date, '');
      $http({
        url: map.mapurl + '/' + siteid,
        method: 'DELETE',
        headers: {  'gameon-id': gid,
                    'gameon-date': date,
                    'gameon-sig-body': '',
                    'gameon-signature': sig,
                    contentType: 'application/json' //what is being sent to the server
        }}).then(function (response) {
                      alert('Room successfully deleted : response from server : ' + response.status);
                      //now remove from various lists
                      for(var i = 0; i < $scope.sites.length; i++) {
                        if($scope.sites[i]._id == siteid) {
                          $scope.sites.splice(i, 1);
                          break; //quit out as found site to remove
                        }
                      }
                      //now set the new active site if any are left, otherwise reset to blank
                      if($scope.sites.length) {
                        $scope.activeSite = $scope.sites[0];
                        $scope.activeSiteId = $scope.activeSite._id;
                      } else {
                        $scope.activeSite = {};
                        $scope.activeSiteId = "";
                      }
                  },
                function (response) {
                      alert('Unable to delete room : response from server : ' + response.data + ':' + response.status);
                  }
      );
   }

  $scope.getSitesForUser();

}]);
