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
  [          '$log','API','$http',
    function ($log,  API,  $http) {
	    console.log("Loading AUTH");
	  
        var _token,
            _authenticated = null; 

        /**
         * Triggered by OAuth-style login: we need to validate the returned
         * token.
         */
        function validate_token(token) {
          $log.debug('Validating token %o', token);
          
          _authenticated = null;
          _token = undefined;
          delete localStorage.token;

          var q = $http({
              method : 'GET',
              url : API.VERIFY_URL + token,
              cache : false
          }).then(function(response) {
              $log.debug('Verify '+response.status + ' ' + response.statusText + ' ' + response.data);
              var tmp = angular.fromJson(response.data);
              
              if ( tmp.valid === "true" ) {
            	console.log("Token was valid");
                // server verified good token.
                _token = token;         
                console.log(_token);
                localStorage.token = angular.toJson(_token);
              } else {
                $q.reject("Token invalid");
              }
              
              return tmp.valid === "true"; // return value of the promise
          }, function(response) {
            $log.debug('verify(outer) '+response.status + ' ' + response.statusText + ' ' + response.data);
          });
          
          _authenticated = q;

          // RETURNING A PROMISE
          return q;
        }
        
        /**
         * Used during login to obtain id for user. 
         */
        function introspect_token() {
          $log.debug('Introspect token %o', _token);
          var token = _token;
          
          _token = undefined;
          delete localStorage.token;

          var q = $http({
              method : 'GET',
              url : API.INTROSPECT_URL + token,
              cache : false
          }).then(function(response) {
              $log.debug('Introspect '+response.status + ' ' + response.statusText + ' ' + response.data);
              var tmp = angular.fromJson(response.data);
              
              //since we now know token state, we can setup a promise that acts like verify had been invoked.
              _authenticated = new Promise(function(resolve,reject){
            	  resolve(tmp.valid);            	  
              });
              
              if ( tmp.valid === "true" ) {
                // server verified good token.
                _token = token;
                tmp.token = token;
                localStorage.token = angular.toJson(_token);
              } else {
                $q.reject("Token invalid");
              }
              
              return tmp; // return value of the promise
          }, function(response) {
            $log.debug('introspect(outer) '+response.status + ' ' + response.statusText + ' ' + response.data);
          });

          // RETURNING A PROMISE
          return q;
        }

        return {
            getAuthenticationState: function () {
                $log.debug('isAuthenticated: %o %o', this, _authenticated);
                if (_authenticated != null) {
                    $log.debug('user already authenticated %o %o',_authenticated,_token);
                } else {
                    $log.debug('attempting to restore session from %o',localStorage.token);
                    var tmp = angular.fromJson(localStorage.token);
                    $log.debug('session restored : %o ',tmp);
                    _authenticated = this.validate_token(tmp);
                }
                return _authenticated;
            },
            validate_token: validate_token,
            introspect_token: introspect_token,
            token: function (){
            	$log.debug("AUTH.TOKEN returning %o ",this._token);
            	return this._token;
            }
        };
    }]);