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
        var _token,
            _authenticated = false; 

        /**
         * Triggered by OAuth-style login: we need to validate the returned
         * token.
         */
        function validate_token(token) {
          $log.debug('Validating token %o', token);
          
          _authenticated = false;
          _token = undefined;
          delete localStorage.token;

          var q = $http({
              method : 'GET',
              url : API.VERIFY_URL + token,
              cache : false
          }).then(function(response) {
              $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
              var tmp = angular.fromJson(response.data);
              
              if ( tmp.valid === "true" ) {
                // server verified good token.
                _token = token;
                _authenticated = true;
                localStorage.token = angular.toJson(_token);
              } else {
                $q.reject("Token invalid");
              }
              
              return tmp.valid === "true"; // return value of the promise
          }, function(response) {
            $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
          });

          // RETURNING A PROMISE
          return q;
        }

        return {
            isAuthenticated: function () {
                $log.debug('isAuthenticated: %o', this);
                if (_authenticated) {
                    $log.debug('user already authenticated');
                    return _authenticated;
                } else {
                    $log.debug('attempting to restore session');
                    var tmp = angular.fromJson(localStorage.token);
                    if (tmp !== undefined) {
                      $log.debug('session restored');
                      return this.validate_token(tmp);
                    } else {
                      return false;
                    }
                }
            },
            validate_token: validate_token,
            token: function () {
                return _token;
            }
        };
    }]);