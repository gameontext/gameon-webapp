'use strict';

/**
 * @ngdoc overview
 * @name playerApp
 * @description
 * # playerApp
 *
 * Main module of the application.
 */
angular.module('playerApp', ['ngResource','ngSanitize','ui.router','ngWebSocket','luegg.directives'])
  .run(
  [          '$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {
      // make life easier
      $rootScope.$on("$stateChangeError", console.log.bind(console));

      // From https://github.com/angular-ui/ui-router/blob/gh-pages/sample/app/app.js
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
    }
  ])
  .constant("API", {
    "PROFILE_URL": "https://"+window.location.host+"/play/players/",
    "WS_URL": "wss://"+window.location.host+"/play/ws1/",
    "VERIFY_URL": "https://"+window.location.host+"/play/auth/verify/",
    "TWITTER": "https://"+window.location.host+"/play/TwitterAuth",
    "FACEBOOK": "https://"+window.location.host+"/play/FacebookAuth",
  })
  .config(
  [          '$stateProvider','$urlRouterProvider',
    function ($stateProvider,  $urlRouterProvider) {
    
      // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
      // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
      $urlRouterProvider
        .otherwise('/');

      //////////////////////////
      // State Configurations 

      $stateProvider
        .state('default', {
          url: '/',
          templateUrl: 'templates/default.html',
          controller: 'DefaultCtrl as default'
        })
        .state('default.login', {
            url: '^/login',
//            onEnter: function($state, auth){
//              if(auth.isAuthenticated() ){
//                $state.go('default.auth');
//              }
//            }
        })
        .state('default.auth', {
          url: '^/login/callback/{token:.*}',
          onEnter: function($stateParams, $state, auth) {
            // Triggered by authentication callback (only). 
            // Verify the returned token... 
            if ( auth.validate_token($stateParams.token) ) {
              $state.go('default.profile');
            } else {
              
            }
          }
        })
        .state('default.profile', { // check profile or initial profile creation
          url: '^/login/profile',
          onEnter: function($state, auth) {
            // Check for a created user profile that exists and stuff.
          }
        })
        .state('default.yuk', {
          url: '^/yuk',
        })
        .state('play', {
          // With abstract set to true, that means this state can not be explicitly activated.
          // It can only be implicitly activated by activating one of its children.
          abstract: true,
          url: '/play',
          templateUrl: 'templates/play.html',
          controller: 'PlayCtrl as play',
          onEnter: function($state, auth){
            if(!auth.isAuthenticated() ){
              $state.go('default.login');
            }
          }
        })
        .state('play.room', {
          url: '',
          templateUrl: 'templates/play.room.html'
        })
        .state('play.go', {
          url: '/go',
          templateUrl: 'templates/play.go.html'
        })
        .state('play.pockets', {
          url: '/pockets',
          templateUrl: 'templates/play.pockets.html'
        })
        .state('play.trophies', {
          url: '/trophies',
          templateUrl: 'templates/play.trophies.html'
        })
        .state('play.me', {
          url: '/me',
          templateUrl: 'templates/play.me.html'
        });
    }
  ]);
