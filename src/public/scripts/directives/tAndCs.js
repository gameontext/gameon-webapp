/*******************************************************************************
 * Copyright (c) 2016 IBM Corp.
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

/*
Provide a tabs directive for displaying user information
*/

'use strict';

angular.module('playerApp')
.directive('tandcs', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/tAndCs.html'
  };
});

angular.module('playerApp')
.controller('tandcsCtrl', ['$scope', function($scope){
  $scope.show = false;
  $scope.toggle = function() {
    $scope.show = !$scope.show;
  }
}]);
