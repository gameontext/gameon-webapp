'use strict';

/**
 * Authentication service. Provides (API) basic isAuthenticated/authenticate methods, 
 * and an oauth_authenticate method for kick starting the oauth2 process based on form
 * submission (wrap provider choices here).
 * 
 * @ngdoc service
 * @name playerApp.auth
 * @description
 * # auth
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('auth', 
  [          '$log',
    function ($log) {
        var _identity,
            _authenticated = false;

        function oauth_authenticate(provider) {
          $log.debug('Authenticate using %o', provider);
          // TODO: Something here for real authentication: 
          authenticate(provider);
          return true;
        }

        function authenticate(identity) {
          _identity = identity;
          _authenticated = identity !== null && identity !== undefined;
          localStorage.userIdentity = angular.toJson(_identity);
        }

        return {
            isAuthenticated: function () {
                $log.debug('isAuthenticated: %o', this);
                if (_authenticated) {
                    //console.log('user already authenticated');
                    return _authenticated;
                } else {
                    //console.log('attempting to restore session');
                    var tmp = angular.fromJson(localStorage.userIdentity);
                    //console.log(tmp);
                    if (tmp !== undefined) {
                        //console.log('session restored');
                        this.authenticate(tmp);
                        return _authenticated;
                    }else{
                        //console.log('session unavailable');
                        return false;                        
                    }
                }
            },
            authenticate: authenticate,
            oauth_authenticate: oauth_authenticate,
            identity: function () {
                return _identity;
            }
        };
    }]);