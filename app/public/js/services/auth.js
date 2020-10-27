'use strict';

/**
 * Authentication service. Provides token validation methods.
 *
 * @ngdoc service
 * @name playerApp.auth
 * @description
 * # auth
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('auth',
  [        '$log','API','$http','$q','playerSession','go_ga',
  function ($log,  API,  $http,  $q,  playerSession,  go_ga) {
    $log.debug("Loading AUTH", go_ga);

    var _token = null,
        _publicKey = null,
        _authenticated = null;

    function get_public_key() {
      $log.debug('Requesting public cert to validate jwts with');
      _publicKey = playerSession.get('publicKey', _publicKey);

      var q = $q.defer();
      if(_publicKey != null) {
        // if _publicKey is defined and not null...
        console.log("Already had cert: %o", _publicKey);
        q.resolve(true);
      } else {
        $http({
          method : 'GET',
          url : API.CERT_URL,
          cache : false
        }).then(function (data) {
          $log.debug('Obtained certificate %o', data.data);
          _publicKey = data.data;
          playerSession.set('publicKey', _publicKey);
          q.resolve(true);
        }, function() {
          q.resolve(false);
        }).catch(console.log.bind(console));
      }
      return q.promise;
    }

    function remember_jwt(jwt) {
      _token = jwt;
    }

    /**
     * Verify if the jwt is still valid.
     */
    function validate_jwt() {
      $log.debug('Validating jwt');
      playerSession.remove('token');
      $log.debug("old token flushed");

      if( typeof _token === 'undefined' ) {
        $log.debug("token validation failed, null token");
        return false;
      }

      try{
        var pubkey = KEYUTIL.getKey(_publicKey);
        var isValid = KJUR.jws.JWS.verifyJWT(_token,pubkey,{alg: ['RS256'] });

        if(isValid) {
          playerSession.set('token', _token);
          $log.debug("token validation passed");
          _authenticated = Promise.resolve(true);
          return true;
        } else {
          $log.debug("token validation failed, invalid token");
          _authenticated = Promise.resolve(false);
          return false;
        }
      } catch (ex) {
        $log.error("Error parsing JWS %o ",ex);
        _authenticated = Promise.resolve(false);
        return false;
      }
    }

    function logout() {
      _authenticated = Promise.resolve(false);
      _token = null;
      playerSession.reset();
    }

    return {
      getAuthenticationState: function () {
        $log.debug('isAuthenticated: %o %o', this, _authenticated);
        if (_authenticated != null) {
          // if _authenticated is defined and not null...
          $log.debug('user already authenticated %o %o', _authenticated, _token);
        } else {
          _token = playerSession.get('token');
          _publicKey = playerSession.get('publicKey');
          $log.debug('attempting to restore jwt from local storage: found: %o  and %o', _token, _publicKey);
          $log.debug('jwt (hopefully) restored, validating...');
          _authenticated = Promise.resolve(this.validate_jwt());
        }
        return _authenticated;
      },
      remember_jwt: remember_jwt,
      validate_jwt: validate_jwt,
      get_jwt: function () {
        if(_token != null) {
          // if _token is defined and not null, pull out the pieces
          var result=0;
          try{
            var jws = new KJUR.jws.JWS();
            result = jws.parseJWS(_token);
            return angular.fromJson(jws.parsedJWS.payloadS);
          } catch (ex) {
            $log.error("Error parsing JWS %o ",ex);
            return null;
          }
        } else {
          return null;
        }
      },
      get_public_key: get_public_key,
      logout: logout,
      token: function () {
          return _token;
      },
      setStartingState: function (state) {
        playerSession.set('startingState', state);
      },
      getStartingState: function () {
        return playerSession.get('startingState');
      }
    };
}]);
