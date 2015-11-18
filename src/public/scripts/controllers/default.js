'use strict';

/**
 * @ngdoc function
 * @name playerApp.controller:DefaultCtrl
 * @description
 * # DefaultCtrl
 * Controller of the playerApp
 */
angular.module('playerApp')
  .controller('DefaultCtrl', 
  [            '$scope','$state','$log', 'API', 'user', 'auth',
    function (  $scope,  $state,  $log,   API,   user,   auth) {
      
      // Login links
      $scope.api = API;
      
      // make the user & auth object persist across states.
      $scope.user = user;      
      $scope.auth = auth;
      
      // tables for name generation.
      var size = ['Tiny','Small','Large','Gigantic','Enormous'];
      var composition = ['Chocolate','Fruit','GlutenFree','Sticky'];
      var extra = ['Iced','Frosted','CreamFilled','JamFilled','MapleSyrupSoaked','SprinkleCovered'];
      var form = ['FairyCake','CupCake','Muffin','PastrySlice','Doughnut'];
      
      $scope.generateUsername = function() {
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
        user.profile.name = name;
      };
      
      $scope.generateColor = function() {
        user.profile.favoriteColor = "Tangerine";
      };
    }
  ]);