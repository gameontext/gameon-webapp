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

	    var _token = null,            
        	_publicKey = null,
            _authenticated = null; 

        function get_public_key(success,failure){
        	$log.debug('Requesting public cert to validate jwts with');
      		if(_publicKey === null){
      			var q = $http({
                    method : 'GET',
                    url : API.CERT_URL,
                    cache : false
                }).then(function (data) {
                	 $log.debug('Obtained certificate', data.data);
			        _publicKey = data.data;
			        localStorage.publicKey = _publicKey;
			        success();
			    }, failure);
      		}else{
      			console.log("Already had cert");
      			console.log(_publicKey);
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
          $log.debug('Validating jwt');
          delete localStorage.token;
          $log.debug("old token flushed");
          
          if(typeof _token === 'undefined'){
        	  $log.debug("token validation failed, null token");
        	  return false;
          }
          
          var pubkey = KEYUTIL.getKey(_publicKey);          
          var isValid = KJUR.jws.JWS.verifyJWT(_token,pubkey,{alg: ['RS256'] });
          
          if(isValid){
	          localStorage.token = angular.toJson(_token);	          	          
	          $log.debug("token validation passed");
	          _authenticated = Promise.resolve(true);
	          return true;
          }else{
        	  $log.debug("token validation failed, invalid token");
	          _authenticated = Promise.resolve(false);
	          return false;
          }
        }               

        function logout() {
          _authenticated = Promise.resolve(false);
          delete localStorage.token;
        }


        return {
            getAuthenticationState: function () {
                $log.debug('isAuthenticated: %o %o', this, _authenticated);
                if (_authenticated !== null) {
                    $log.debug('user already authenticated %o %o',_authenticated,_token);
                } else {
                    $log.debug('attempting to restore jwt from localstorage: found: %o  and %o',localStorage.token,localStorage.publicKey);
                    _token = angular.fromJson(localStorage.token);
                    _publicKey = localStorage.publicKey;
                    $log.debug('jwt (hopefully) restored, validating...');
                    _authenticated = Promise.resolve(this.validate_jwt());
                }
                return _authenticated;
            },            
            remember_jwt: remember_jwt,
            validate_jwt: validate_jwt,   
            get_jwt: function () {
            	$log.debug("Obtaining JWT payload, performing revalidation of jwt first");
            	if(validate_jwt()){
            		var result=0;
            		try{    
            			var jws = new KJUR.jws.JWS();
            			result = jws.parseJWS(_token);
            			return angular.fromJson(jws.parsedJWS.payloadS);
            		} catch (ex) {
            			$log.error("Error parsing JWS %o ",ex);
            			return null;
            		}            		
            	}else{
            		return null;
            	}
            },
            get_public_key: get_public_key,
            logout: logout,

            token: function (){
            	$log.debug("AUTH.TOKEN returning %o ",_token);
            	return _token;
            }
        };
    }]);
