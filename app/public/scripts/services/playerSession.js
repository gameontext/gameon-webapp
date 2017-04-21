'use strict';

/**
 * Cache and retrieve information from local storage in the device.
 *
 * @ngdoc service
 * @name playerApp.playerSession
 * @description
 * # playerSocket
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('playerSession',
  [          '$log',
    function ($log) {

      // Read in what was stashed in local storage
      var elements = angular.extend({}, angular.fromJson(localStorage.playerSession));
      $log.debug("Retrieved local storage %o", elements);

      var get = function(key) {
        return elements[key];
      };

      var reset = function() {
        // Clear local storage entirely
        elements = {};
        delete localStorage.playerSession;
      };

      var save = function() {
        $log.debug("Update local storage %o", elements);
        localStorage.playerSession = angular.toJson(elements);
      };

      var set = function(key, value) {
        elements[key] = value;
        save();
      };

      var remove = function(key) {
        delete elements[key];
      };

      // Available methods and structures
      var sharedApi = {
        get: get,
        set: set,
        remove: remove,
        reset: reset,
        save: save
      };

      return sharedApi;
    }
  ]);
