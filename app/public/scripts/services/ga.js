/*******************************************************************************
 * Copyright (c) 2017 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

//service for Google analytics

'use strict';

angular.module('playerApp')
   .factory('ga',
    [      '$log','$window',
  function ($log,  $window) {
    $log.debug("GA Svc :Initialising Google analytics service");

    //only turn on analytics for live site
    var googleAnalytics = window.location.hostname === 'gameontext.org';
    $log.debug("GA Svc : Google Analytics is currently set to  : " + googleAnalytics);

    var report = function(p1, p2, p3, p4, p5) {
      if (googleAnalytics) {
          $window.ga(p1, p2, p3, p4, p5);
      } else {
          $log.debug("GA Svc: Logging request for ga(%o %o %o %o %o)", p1, p2, p3, p4, p5);
      }
    };

    if (googleAnalytics) {
      $window.ga('create', 'UA-90113653-2', 'auto');
      $window.ga('send', 'pageview');
    }

    return {
       report : report
    };
}]);
