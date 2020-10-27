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
  [          '$log','$state','API','$http','auth','go_ga',
    function ($log,  $state,  API,  $http,  auth,  go_ga) {

    var generatedNames = [];
    var generatedColors = [];

    var profile = {};

    var rules = {};
    rules.nameRule = "At least 3 characters, no spaces.";
    rules.namePattern = /^\w{3,}$/;
    rules.colorRule = "At least 3 characters, no spaces.";
    rules.colorPattern = /^\w{3,}$/;

    var refresh = function() {
      $log.debug('loading user %o', profile._id);
      var gameonHeaders = {'gameon-jwt': auth.token()};
      var q;

      q = $http({
        method : 'GET',
        url : API.PROFILE_URL + 'accounts/' + profile._id,
        cache : false,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug('%o: %o %o', API.PROFILE_URL + 'accounts/' + profile._id, response.status, response.statusText);
        angular.extend(profile, angular.fromJson(response.data));
        $log.debug('updated profile: %o', profile);
        return true;
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        return false;
      }).catch(console.log.bind(console));

      return q;
    };

    var load = function() {
      var jwt = auth.get_jwt();
      $log.debug('loading user %o', jwt.id);

      //we're using the id from the token introspect as our player db id.
      profile._id = jwt.id;
      profile.name = jwt.name.replace(/ /g , '_');
      profile.playerMode = "default";
      profile.story = "none";

      return refresh();
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
        go_ga.report('send','event','GameOn','User','create');
        $log.debug('%o: %o %o', API.PROFILE_URL + 'accounts/', response.status, response.statusText);
        angular.extend(profile, angular.fromJson(response.data));
        $log.debug('updated profile: %o', profile);
        // Replace browser history (now existing player)
        $state.go('play.room', {}, {location: "replace"});
      }, function(response) {
        $log.debug('%o: %o', response.status, response.statusText);
        // go to the sad state.. (Can't find the player information, and can't save it either)
        $state.go('default.yuk');
      })
      .catch(console.log.bind(console));
    };

    var update = function() {
      $log.debug("Updating user with: %o", profile);
      // Update user
      var gameonHeaders = {'gameon-jwt': auth.token()};
      var q;

      q = $http({
        method : 'PUT',
        url : API.PROFILE_URL + 'accounts/' + profile._id,
        cache : false,
        data : profile,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug('%o: %o %o', API.PROFILE_URL + 'accounts/' + profile._id, response.status, response.statusText);
        angular.extend(profile, angular.fromJson(response.data));
        $log.debug('updated profile: %o', profile);
        go_ga.report('send','event','GameOn','User','update');
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        // TODO: Alert
      }).catch(console.log.bind(console));

      return q;
    };

    var updateSharedSecret = function() {
      $log.debug("Updating user sharedSecret for profile : %o", profile);
      // Update user
      var gameonHeaders = {'gameon-jwt': auth.token()};
      var q;

      q = $http({
        method : 'PUT',
        url : API.PROFILE_URL + 'accounts/' + profile._id + '/credentials/sharedSecret',
        cache : false,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug('%o: %o %o', API.PROFILE_URL + 'accounts/' + profile._id, response.status, response.statusText);
        angular.extend(profile, angular.fromJson(response.data));
        $log.debug('updated profile: %o', profile);
        go_ga.report('send','event','GameOn','User','secretUpdate');
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        // TODO: Alert
      })
      .catch(console.log.bind(console));
      return q;
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
        refresh: refresh,
        update: update,
        updateSharedSecret: updateSharedSecret,
        generateName: generateName,
        generateColor: generateColor
    };
  }]);
