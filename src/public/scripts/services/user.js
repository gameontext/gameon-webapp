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
  [          '$log','$state','API','$http','auth','ga',
    function ($log,  $state,  API,  $http,  auth,  ga) {

    var generatedNames = [];
    var generatedColors = [];

    var profile = {};

    var rules = {};
    rules.nameRule = "At least 3 characters, no spaces.";
    rules.namePattern = /^\w{3,}$/;
    rules.colorRule = "At least 3 characters, no spaces.";
    rules.colorPattern = /^\w{3,}$/;

    var load = function(id,name) {
      $log.debug('quering token %o',auth.token());

      //we're using the id from the token introspect as our player db id.
      profile._id = id;

      // Load the user's information from the DB and/or session
      // Load needs to come from the Auth token
      var gameonHeaders = {'gameon-jwt': auth.token()};
      var q;

      // Fetch data about the user
      q = $http({
        method : 'GET',
        url : API.PROFILE_URL + 'accounts/' + profile._id,
        cache : false,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

        var tmp = angular.fromJson(response.data);
        $log.debug('profile: %o', tmp);

        angular.extend(profile, tmp);

        return true;
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

        // User can't be found, which is fine, we can go build one!
        profile.name = name.replace(/ /g , '_');

        return false;
      }).catch(console.log.bind(console));

      return q;
    };

    var create = function() {
      $log.debug("Creating user with: %o", profile);
      // CREATE -- needs to test for ID uniqueness.. so only go on to
      // the next state if all data could validate properly.
      var gameonHeaders = {'gameon-jwt': auth.token()};

      $http({
        method : 'POST',
        url : API.PROFILE_URL + 'accounts/',
        cache : false,
        data : profile,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        console.log("GA");
        console.log(ga);
        ga.report('send','event','GameOn','User','create');
        //post succeeded, now refresh the profile from the server to pull the new key.
        load(profile._id, profile.name).finally(function(response){
          $state.go('play.room');
        });
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

        // go to the sad state.. (Can't find the player information, and can't save it either)
        $state.go('default.yuk');
      }).catch(console.log.bind(console));
    };

    var update = function() {
        $log.debug("Updating user with: %o", profile);
      // Update user
      var gameonHeaders = {'gameon-jwt': auth.token()};

      $http({
        method : 'PUT',
        url : API.PROFILE_URL + 'accounts/' + profile._id,
        cache : false,
        data : profile,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        ga.report('send','event','GameOn','User','update');
        //put succeeded, now refresh the profile from the server to pull the new key.
        load(profile._id, profile.name).finally(function(response){
          $state.go('play.room');
        });

      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        // TODO: Alert
      }).catch(console.log.bind(console));
    };

    var updateSharedSecret = function() {
        $log.debug("Updating user sharedSecret for profile : %o", profile);
      // Update user
      var gameonHeaders = {'gameon-jwt': auth.token()};

      $http({
        method : 'PUT',
        url : API.PROFILE_URL + 'accounts/' + profile._id + '/credentials/sharedSecret',
        cache : false,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        ga.report('send','event','GameOn','User','secretUpdate');
        //update succeeded, now refresh the profile from the server to pull the new key.
        load(profile._id, profile.name);
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        // TODO: Alert
      }).catch(console.log.bind(console));

    };

    var generateName = function() {
      $log.debug('generate a name: %o', generatedNames);
      var name = generatedNames.pop();
      var gameonHeaders = {'gameon-jwt': auth.token()};

      if (typeof name === 'undefined') {
        // no generated names (all used up). Let's grab some more.
        $http({
          method : 'GET',
          url : API.PROFILE_URL + 'name',
          cache : false,
          headers : gameonHeaders
        }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

          var tmp = angular.fromJson(response.data);
          profile.name = tmp.pop();
          generatedNames = tmp;

        }, function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

          //error block, we failed to get any names, better use a placeholder.
          profile.name = 'MagicalSparkleUnicorn';
        }).catch(console.log.bind(console));
      } else {
        profile.name = name;
      }
    };

    var generateColor = function() {
      $log.debug('generate a color: %o', generatedColors);
      var color = generatedColors.pop();

      if (typeof color === 'undefined') {
        // no generated colors (all used up). Let's grab some more.
    	var gameonHeaders = {'gameon-jwt': auth.token()};
        $http({
          method : 'GET',
          url : API.PROFILE_URL + 'color',
          cache : false,
          headers : gameonHeaders
        }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

          var tmp = angular.fromJson(response.data);
          profile.favoriteColor = tmp.pop();
          generatedColors = tmp;

        }, function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

          //error block, we failed to get any colors, better use a placeholder.
          profile.favoriteColor = 'Tangerine';
        }).catch(console.log.bind(console));
      } else {
        profile.favoriteColor = color;
      }
    };

    return {
        profile: profile,
        rules: rules,
        load: load,
        create: create,
        update: update,
        updateSharedSecret: updateSharedSecret,
        generateName: generateName,
        generateColor: generateColor
    };
  }]);
