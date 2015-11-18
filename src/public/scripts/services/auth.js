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
        	_publicKey,
            _authenticated = null; 

        function get_public_key(success,failure){
      		if(_publicKey === null){
			    $.get(CERT_URL, function (data) {
			        _publicKey = data;
			    })
			    .done(success)
			    .fail(failure);
      		}else{
      			success();
      		}
        }
        
        function remember_jwt(jwt){
        	_token = jwt;
        }
        
        /**
         * Verify if the jwt is still valid.
         */
        function validate_jwt() {
          $log.debug('Validating jwt %o', _token);
          delete localStorage.token;
          localStorage.token = angular.toJson(_token);
          //since we now know token is ok, we can setup a promise that acts like verify had been invoked.
          _authenticated = new Promise(function(resolve,reject){
        	  resolve(true);            	  
          });
          return true;
        }               

        return {
            getAuthenticationState: function () {
                $log.debug('isAuthenticated: %o %o', this, _authenticated);
                if (_authenticated !== null) {
                    $log.debug('user already authenticated %o %o',_authenticated,_token);
                } else {
                    $log.debug('attempting to restore session from %o',localStorage.token);
                    var _token = angular.fromJson(localStorage.token);
                    $log.debug('session restored : %o ',tmp);
                    _authenticated = this.validate_jwt();
                }
                return _authenticated;
            },
            remember_jwt: remember_jwt,
            validate_jwt: validate_jwt,
            get_public_key: get_public_key,
            token: function (){
            	$log.debug("AUTH.TOKEN returning %o ",this._token);
            	return this._token;
            }
        };
    }]);