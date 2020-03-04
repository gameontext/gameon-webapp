'use strict';

/**
 * Profile Core directive. Used in default.html and play.me.html to render
 * the core profile update fields (name / favorite color / etc).
 *
 * @ngdoc directive
 * @name profileCore
 * @description
 * #
 * Factory in the playerApp.
 */
angular.module('playerApp')
.directive('profileCore', function() {
  return {
    scope: {
      user: '=',
      form: '='
    },
    restrict: 'E',
    templateUrl: '/profileCore.html'
  };
});
