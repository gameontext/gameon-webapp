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
.directive('tabContent', function() {
  return {
    scope: {
      title: '@'
    },
    restrict: 'E',
    transclude: true,
    template: '<div class="tab-content" ng-show="activeTab" ng-transclude></div>',
    link: function(scope, elem, attr, tabContainerController) {
      scope.activeTab = false,
      tabContainerController.add(scope);
    },
    require: '^tabContainer'
  };
});

angular.module('playerApp')
.directive('tabContainer', function() {
  return {
    scope: {
    },
    restrict: 'E',
    transclude: true,
    templateUrl: 'templates/tab.container.html',
    bindToController: true,
    controllerAs: 'tabContainer',
    controller: function() {
      this.tabList = [];
      this.selected = undefined;

      this.add = function add(tab) {
        if(!this.tabList.length) {
          console.log("TAB : setting active tab to " + tab.title);
          this.selected = tab;
          tab.activeTab = true;  //first tab added is the one shown by default
        }
        this.tabList.push(tab)
      }

      this.select = function(newTab) {
        if(newTab != this.selected) {
          console.log("TAB : setting active tab to " + newTab.title);
          this.selected.activeTab = false;
          this.selected = newTab;
          this.selected.activeTab = true;
        }
      }
    }
  };
});
