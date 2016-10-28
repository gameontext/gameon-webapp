'use strict';

/**
 * This encapsulates using the root scope as a msg bus for notifications. It
 * ensures the $rootScope is used (no percolation or bubbling that would impact
 * performance), and manages automatic unbind of the caller to onMsg by setting
 * up a handler that reacts to $destroy.
 */
angular.module('playerApp')
    .factory('msgBus',
     [      '$log','$rootScope',
   function ($log,  $rootScope) {
      $log.debug("Loading msgBus");

  var msgBus = {};

  msgBus.emitMsg = function(msg, data) {
    data = data || {};
    $rootScope.$emit(msg, data);
  };
  msgBus.onMsg = function(msg, func, scope) {
    var unbind = $rootScope.$on(msg, func);
    if (scope) {
      // automatically unbind when the scope is destroyed
      scope.$on('$destroy', unbind);
    }
    return unbind;
  };

  // Convenience method for reporting an error
  msgBus.notifyErrorResponse = function(newData) {
    msgBus.emitMsg('errorResponse', newData);
  };
  msgBus.onErrorResponse = function(func, scope) {
    msgBus.onMsg('errorResponse', func, scope);
  };

  return msgBus;
}]);
