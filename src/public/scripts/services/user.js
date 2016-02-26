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
  [          '$log','$state','API','$http','auth',
    function ($log,  $state,  API,  $http,  auth) {

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
        url : API.PROFILE_URL + profile._id,
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
        url : API.PROFILE_URL,
        cache : false,
        data : profile,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        $state.go('play.room');

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
        url : API.PROFILE_URL + profile._id,
        cache : false,
        data : profile,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        $state.go('play.room');

      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        // go to the sad state.. (Can't find the player information, and can't save it either)
        $state.go('default.yuk');
      }).catch(console.log.bind(console));
    };
    
    var updateApiKey = function() {
        $log.debug("Updating user apikey for profile : %o", profile);
      // Update user
      var gameonHeaders = {'gameon-jwt': auth.token()};
      
      delete profile.apiKey;

      $http({
        method : 'PUT',
        url : API.PROFILE_URL + profile._id,
        cache : false,
        data : profile,
        headers : gameonHeaders
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        //update succeeded, now refresh the profile from the server to pull the new key.
        load(profile._id, profile.name);
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);
        // go to the sad state.. (Can't find the player information, and can't save it either)
        $state.go('default.yuk');
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
          url : API.PROFILE_URL + 'names',
          cache : false,
          headers : gameonHeaders
        }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

          var tmp = angular.fromJson(response.data);
          profile.name = tmp.names.pop();
          generatedNames = tmp.names;

        }, function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

          //fallback name generation.

			var size = ['Tiny','Small','Large','Gigantic','Enormous'];
			var composition = ['Chocolate','Fruit','GlutenFree','Sticky'];
			var extra = ['Iced','Frosted','CreamFilled','JamFilled','MapleSyrupSoaked','SprinkleCovered'];
			var form = ['FairyCake','CupCake','Muffin','PastrySlice','Doughnut'];
			var variant = Math.floor((Math.random() * 5) );
			var name = "FrostedCupcake";
			switch(variant){
				case 0:
					name = size[Math.floor((Math.random() * size.length))]+composition[Math.floor((Math.random() * composition.length))]+form[Math.floor((Math.random() * form.length))];
					break;
				case 1:
					name = composition[Math.floor((Math.random() * composition.length))]+extra[Math.floor((Math.random() * extra.length))]+form[Math.floor((Math.random() * form.length))];
					break;
				case 2:
					name = size[Math.floor((Math.random() * size.length))]+extra[Math.floor((Math.random() * extra.length))]+form[Math.floor((Math.random() * form.length))];
					break;
				case 3:
					name = extra[Math.floor((Math.random() * extra.length))]+form[Math.floor((Math.random() * form.length))];
					break;
				case 4:
					name = size[Math.floor((Math.random() * size.length))]+form[Math.floor((Math.random() * form.length))];
					break;
				case 5:
					name = composition[Math.floor((Math.random() * composition.length))]+form[Math.floor((Math.random() * form.length))];
					break;
			}

          profile.name = name;
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
          url : API.PROFILE_URL + 'colors',
          cache : false,
          headers : gameonHeaders
        }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

          var tmp = angular.fromJson(response.data);
          profile.favoriteColor = tmp.colors.pop();
          generatedColors = tmp.colors;

        }, function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + response.data);

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
        updateApiKey: updateApiKey,
        generateName: generateName,
        generateColor: generateColor
    };
  }]);
