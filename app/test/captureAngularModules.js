'use strict';

// this decorate angular.module so that in tests it is possible to
// inspect the global angular.modules array to verify loaded modules.
(function(orig) {
    angular.modules = [];
    angular.module = function() {
        if (arguments.length > 1) {
            angular.modules.push(arguments[0]);
        }
        return orig.apply(null, arguments);
    };
})(angular.module);
