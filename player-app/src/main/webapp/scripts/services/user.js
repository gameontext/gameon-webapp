'use strict';

/**
 * User service. Wraps fetch to/from server and local storage to deal
 * with information about the user/player.
 * 
 * @ngdoc service
 * @name playerApp.user
 * @description
 * # user
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('user',
  [          '$log','$state','API','$http',
    function ($log,  $state,  API,  $http) {

    var user = {};
    
    user.profile = {};
    
    user.rules = {}
    user.rules.nameRule = "At least 3 characters, no spaces.";
    user.rules.namePattern = /^\w{3,}$/;
    user.rules.colorRule = "At least 3 characters, no spaces.";
    user.rules.colorPattern = /^\w{3,}$/;
    
    user.load = function() {
      // Load the user's information from the DB and/or session
      // Load needs to come from the Auth token
      var playerURL = API.PROFILE_URL + 'wasdev';
      var parameters = {};
      var q;

      // Fetch data about the user
      $log.debug('fetch data from %o', playerURL);
      q = $http({
          method : 'GET',
          url : playerURL,
          cache : false,
          params : parameters
      }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

          
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

        // go to the sad room.. (Can't find the player information)
        // or back to the login/registration screen? or.. 
      });
    };
    
    user.save = function() {
      $log.debug("Saving user data: %o", user.profile);
      // SAVE GOES HERE -- save needs to test for ID uniqueness.. so only go on to 
      // the next room if all data could validate properly.
      var playerURL = API.PROFILE_URL + 'wasdev';
      
      var q = $http({
        method : 'POST',
        url : playerURL,
        cache : false,
        data : user.profile
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);
        $state.go('play.room');
        
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

        // go to the sad room.. (Can't find the player information)
        // or back to the login/registration screen? or.. 
      });
      
    };
    
    return user;
  }]);