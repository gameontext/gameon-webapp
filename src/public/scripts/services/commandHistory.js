'use strict';

/**
 * CommandHistory service. Provide, well, command history, for the play controller.
 *
 * @ngdoc service
 * @name playerApp.commandHistory
 * @description
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('commandHistory',
  [          '$log',
    function ($log) {

      var cmds = [];
      var last = 0;

      function push(cmd) {
        cmds.push(cmd);
        last = cmds.length;
      }

      function reset() {
        last = cmds.length;
      }

      function prev(prefix) {
        $log.debug(["prev", prefix, cmds, last]);
        for (var cur = Math.max(last - 1, -1); cur >= 0; cur--) {
          if (cmds[cur].indexOf(prefix || '') === 0) {
            last = cur;
            return cmds[cur];
          }
        }

        if (last > -1 && last < cmds.length) {
          return cmds[last];
        }

        return null;
      }

      function next(prefix) {
        $log.debug(["next", prefix, cmds, last]);
        for (var cur = Math.min(last + 1, cmds.length); cur < cmds.length; cur++) {
          if (cmds[cur].indexOf(prefix || '') === 0) {
            last = cur;
            return cmds[cur];
          }
        }

        last = cur;
        return null;
      }

      return {
        push: push,
        prev: prev,
        next: next,
        reset: reset
      };
    }
  ]
);
