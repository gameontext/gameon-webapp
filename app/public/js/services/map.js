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
    [      '$log','$state','$q','API','$http','user', 'go_ga',
  function ($log,  $state,  $q,  API,  $http,  user,   go_ga) {
     $log.debug("Loading MAP");

  var mapurl = '/map/v1/sites';  //where to get the data from


  //convert a hex string into characters
  function hexToString(hex) {
    var result = '';
    for (var i = 0; i < hex.length; i += 2) {
      var val = hex.substr(i, 2);
      result += String.fromCharCode(parseInt(val, 16));
    }
    return result;
  }

  function toUTF8(str) {
    return unescape(encodeURIComponent(str)); //convert from UTF16 -> UTF8
  }

  //pads a numeric value with additional zeros
  function pad(value) {
    return value < 10 ? '0' + value : value;
  }

  //construct a SHA256 hash of the supplied value
  function hash(value) {
    var md = new KJUR.crypto.MessageDigest({"alg": "sha256", "prov": "cryptojs"});
    var utf8 = unescape(encodeURIComponent(value)); //convert from UTF16 -> UTF8
    var hashValue;

    md.updateString(utf8);
    hashValue = md.digest();
    $log.debug('Hash : ' + hashValue);

    hashValue = btoa(hexToString(hashValue));
    $log.debug('Base64 : ' + hashValue);

    return hashValue;
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

  //create a valid hmac to send to the servers
  function hmac(id, secret, date, bodyHash) {
    var mac = new KJUR.crypto.Mac({"alg": "HmacSHA256", "pass": toUTF8(secret)});
    var headers = "";  //this would be the hash of any game on headers
    var params = "";  //this would be the hash of any query string parameters
    var hmacValue;

    //send in old style
    //mac.updateString(toUTF8("POST"));
    //mac.updateString(toUTF8("/map/v1/sites"));
    mac.updateString(toUTF8(id));
    mac.updateString(toUTF8(date));
    mac.updateString(toUTF8(headers));
    mac.updateString(toUTF8(params));

    hmacValue = mac.doFinalString(toUTF8(bodyHash));
    $log.debug('HMAC : ' + hmacValue);

    hmacValue = btoa(hexToString(hmacValue));
    $log.debug('Base64 : ' + hmacValue);

    return hmacValue;
  }

  function signRequest(body) {
    var date = now();
    var bodyHash = hash(body);
    var gid = user.profile._id;
    var secret = user.profile.credentials.sharedSecret;
    var sig = hmac(gid, secret, date, bodyHash);

    return {
      'gameon-id': gid,
      'gameon-date': date,
      'gameon-sig-body': bodyHash,
      'gameon-signature': sig,
      'contentType': 'application/json' //what is being sent to the server
    };
  }

  var getSitesForUser = function() {
    $log.debug("MAP : GET : for user " + user.profile._id);

    var q = $q.defer();
    $http({
      url: mapurl,
      method: 'GET',
      params: {owner: user.profile._id},
      headers: signRequest("")
      }).then(function(response) {
        // 200: rooms discovered
        // 204: no rooms for the user
        $log.debug(response.status + ' ' + response.statusText + " %o - OK", response.data);
        var data = [];
        if ( response.status === 200 ) {
          data = angular.fromJson(response.data);
          if( typeof data === 'undefined' ) {
            // TODO: Alert -- problem occurred
            $log.error("Bad JSON data %s", response.data);
            data = [];
          }
        }
        $log.debug("getSitesForUser returing %o", data);
        q.resolve(data);
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + " %o - FAILED", response.data);
        // TODO: Alert -- problem occurred
        // return empty set for decent experience
        q.resolve([]);
      }).catch(console.log.bind(console));

      return q.promise;
  };

  var createSiteForUser = function(newSite) {
    $log.debug("MAP : CREATE : %o", newSite);
    go_ga.report('send','event','GameOn','Map','createSite');
    if(newSite.info.connectionDetails && !newSite.info.connectionDetails.type) {
      newSite.info.connectionDetails.type = 'websocket';
    }
    var body = angular.toJson(newSite.info);

    var q = $q.defer();
    $http({
        url: mapurl,
        method: 'POST',
        headers: signRequest(body),
        data: body
      }).then(function(response) {
        // 201: room created
        $log.debug(response.status + ' ' + response.statusText + " %o - OK", response.data);
        q.resolve(response.data);
      }, function(response) {
        // 400: bad request
        // 403: unauthorized
        // 409: save conflict
        $log.debug(response.status + ' ' + response.statusText + " %o - FAILED", response.data);
        response.data.reason = response.status + ' ' + response.statusText;
        q.reject(response.data);
      }).catch(console.log.bind(console));

    return q.promise;
  };

  var deleteSiteForUser = function(newSite) {
    $log.debug("MAP : DELETE : %o", newSite._id);
    go_ga.report('send','event','GameOn','Map','deleteSite');
    var q = $q.defer();
    $http({
        url: mapurl + '/' + newSite._id,
        method: 'DELETE',
        headers: signRequest("")
      }).then(function(response) {
        // 204: room deleted (no content)
        $log.debug(response.status + ' ' + response.statusText + " %o - OK", response.data);
        q.resolve(newSite._id);
      }, function(response) {
        // 400: bad request
        // 403: unauthorized
        // 404: not found / previously deleted
        // 409: save conflict
        $log.debug(response.status + ' ' + response.statusText + " o - FAILED", response.data);
        if ( response.status === 404 ) {
            // Previously deleted. No worries.
            q.resolve(newSite._id);
        } else {
          response.data.reason = response.status + ' ' + response.statusText;
          q.reject(response.data);
        }
      }).catch(console.log.bind(console));

    return q.promise;
  };

  var updateSiteForUser = function(newSite) {
    $log.debug("MAP : UPDATE : %o", newSite);
    go_ga.report('send','event','GameOn','Map','updateSite');
    if(newSite.info.connectionDetails && !newSite.info.connectionDetails.type) {
      newSite.info.connectionDetails.type = 'websocket';
    }
    var body = angular.toJson(newSite.info);

    var q = $q.defer();
    $http({
      url: mapurl + '/' + newSite._id,
        method: 'PUT',
        headers: signRequest(body),
        data: body
      }).then(function(response) {
        // 200: OK
        $log.debug(response.status + ' ' + response.statusText + " %o - OK", response.data);
        q.resolve(response.data);
      }, function(response) {
        // 400: bad request
        // 403: unauthorized
        // 404: not found / previously deleted
        // 409: save conflict
        $log.debug(response.status + ' ' + response.statusText + " %o - FAILED", response.data);
        response.data.reason = response.status + ' ' + response.statusText;
        q.reject(response.data);
      }).catch(console.log.bind(console));

    return q.promise;
  };

  return {
    getSitesForUser: getSitesForUser,
    createSiteForUser: createSiteForUser,
    deleteSiteForUser: deleteSiteForUser,
    updateSiteForUser: updateSiteForUser
  };
}]);
