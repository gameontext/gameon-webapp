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
     var sites = []; //list of rooms registered to this ID
     var activeSite = undefined;

     getRoomsForUser();   //initial population of rooms

     function getRoomsForUser() {
       console.log("MAP : Getting list of rooms for user : " + user.profile._id);
       $http({
         method: 'GET',
         url: mapurl
       }).success(function(data) {
         //need to filter out rooms that are not associated with this user
         console.log("MAP : filtering registered rooms");
         var siteSet = {};
         angular.forEach(data, function(site) {
           sites = [];
           console.log("MAP : checking " + JSON.stringify(site.owner));
           if(site.owner == user.profile._id) {
             console.log("MAP : found room - " + site._id);
             sites.push(site);
             if(!activeSite) {
               activeSite = site; //set the active site to the first one if not already set
             }
           }
         });
       });
     }

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

    //register or update a specified room
    function registerOrUpdate(room, roomid) {
       var date = now();
       var body = JSON.stringify(room).trim();
       var bodyHash = hash(body);
       var gid = user.profile._id;
       var secret = user.profile.credentials.sharedSecret;
       var sig = hmac(gid, secret, date, bodyHash);
       var verb = roomid ? 'PUT' : 'POST';
       var endpoint = roomid ? mapurl + '/' + roomid : mapurl;

       $http({
           url: mapurl,
           method: verb,
           headers: {  'gameon-id': gid,
                       'gameon-date': date,
                       'gameon-sig-body': bodyHash,
                       'gameon-signature': sig,
                       'contentType': 'application/json', //what is being sent to the server
           },
           data: body
         }).then(function (response) {
                       alert('regsiter/update successful : response from server : ' + response.status);
                   },
                 function (response) {
                       alert('Unable to register/update room : response from server : ' + response.data + ':' + response.status);
                   }
       );

    }

     function add() {
       console.log("MAP : registering new room");
       var data = inputToJSON("roomInfo_", "unknown");
       var room = adaptToRoom(data);
       console.log("MAP : registering room - " + JSON.stringify(room));
       registerOrUpdate(room);
       getRoomsForUser();
     }

     function update() {
       console.log("MAP : updating existing room");
     }

     function remove() {
       var siteid = document.getElementById("roomInfo_id").value;
       var gid = user.profile._id;
       var secret = user.profile.credentials.sharedSecret;
       console.log("MAP : deleting room " + siteid);
       var date = now();
        var sig = hmac(gid, secret, date, '');
        $http({
          url: mapurl + '/' + siteid,
          method: 'DELETE',
          headers: {  'gameon-id': gid,
                      'gameon-date': date,
                      'gameon-sig-body': '',
                      'gameon-signature': sig,
                      contentType: 'application/json' //what is being sent to the server
          }}).then(function (response) {
                        alert('Room successfully deleted : response from server : ' + response.status);
                        //remove from the array of rooms
                        for(var i = 0; i < sites.length; i++) {
                          if(sites[i] == siteid) {
                            sites.splice(i, 1);
                          }
                        }
                        consolelog("MAP : rooms afer delete - " + JSON.stringify(sites));
                    },
                  function (response) {
                        alert('Unable to delete room : response from server : ' + response.data + ':' + response.status);
                    }
        );
     }

     return {
         mapurl: mapurl,
         sites: sites,
         add: add,
         update: update,
         remove: remove,
         test: remove,
         activeSite : activeSite
     };

   }
 ]
);
