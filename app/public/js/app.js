/*!
 * Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements;
 * and to You under the Apache License, Version 2.0.
 */
'use strict';

/**
 * @ngdoc overview
 * @name playerApp
 * @description
 * # playerApp
 *
 * Main module of the application.
 */

var baseUrl = window.location.host;

// Angular templates (used to feed $templateCache)
angular.module('templates', []);

angular.module('playerApp', ['ngResource','ngSanitize','ui.router','ngWebSocket','luegg.directives', 'hc.marked', 'templates'])
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
    "HOST": baseUrl,
    "PROFILE_URL": "https://"+baseUrl+"/players/v1/",
    "WS_URL": "wss://"+baseUrl+"/mediator/ws/",
    "CERT_URL": "https://"+baseUrl+"/auth/PublicCertificate",
    "GOOGLE": "https://"+baseUrl+"/auth/GoogleAuth",
    "TWITTER": "https://"+baseUrl+"/auth/TwitterAuth",
    "FACEBOOK": "https://"+baseUrl+"/auth/FacebookAuth",
    "GITHUB": "https://"+baseUrl+"/auth/GitHubAuth",
    "DUMMY": "https://"+baseUrl+"/auth/DummyAuth?dummyUserName=DevUser&callbackHost=https://"+baseUrl
  })
  .config(['markedProvider', function (markedProvider) {
    markedProvider.setOptions({sanitize: true});
  }])
  .config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
  }])
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
          templateUrl: 'default.html',
          controller: 'DefaultCtrl as ctrl',
          onEnter: function(go_ga){
            console.info("state -> default");
            go_ga.hit('default');
          }
        })
        .state('default.terms', {
          url: '^/terms'
        })
        .state('default.login', {
          url: '^/login',
          onEnter: function(go_ga){
            console.info("state -> default.login");
            go_ga.hit('login');
            go_ga.report('send','event','GameOn','App','login');
          }
        })
        .state('default.auth', {
          url: '^/login/callback/{jwt:.*}',
      // State triggered by authentication callback (only).
          onEnter: function($state, $stateParams, auth) {
            console.info("state -> default.auth");
            auth.get_public_key(
            function(){
                console.log("got public cert.. proceeding to jwt validation.");

              auth.remember_jwt($stateParams.jwt);
              $state.go('default.validatejwt');
            },
            function(){
              //TODO: handle failure to obtain public key.
              //      can't do much without it.
              $state.go('default.yuk');
            });
           }
        })
        .state('default.validatejwt', {
          url: '^/login/getpubliccert',
      // State triggered by auth obtaining public key
          onEnter: function($state, $stateParams, auth, go_ga) {
            // this step has to read the token from the params passed ($stateParams.token)
            // and cause it to be stashed into the auth object so we can rely on it going forwards.

            console.info("state -> default.validatejwt");
            if(auth.validate_jwt()){
                console.log("token callback from auth service was valid");
                go_ga.report('send','event','GameOn','App','login-pass');
                $state.go('default.usersetup');
            }else{
                //TODO: goto a login failed page..
                go_ga.report('send','event','GameOn','App','login-fail');
                $state.go('default.login');
            }
          }
        })
        .state('default.usersetup', {
          url: '^/login/usersetup',
          // Triggered by default.auth state.
          onEnter: function($state, $stateParams,auth,user,go_ga) {
            console.info("state -> default.usersetup");
            go_ga.hit('usersetup');
            console.log("building user object");
            var jwt = auth.get_jwt();
            if (jwt !== null){
                // Verify the returned token...
                console.log("cached/recovered token was valid, token info object was");
                console.log(jwt);
                //user.load returns a promise that resolves to true if the user was found.. false otherwise.
                user.load(jwt.id, jwt.name).then(function(userKnownToDB){
                  if(userKnownToDB){
                    go_ga.report('send','event','GameOn','App','login-existing');
                    $state.go('play.room');
                  }else{
                    go_ga.report('send','event','GameOn','App','login-new');
                    $state.go('default.profile');
                  }
                });
              }else{
                //cached / recovered token was invalid.
                //TODO: goto a login failed page..
                $state.go('default.login');
              }
          }
        })
        .state('default.profile', { // initial profile creation
          url: '^/login/profile',
          onEnter: function($state, $stateParams, user, auth, go_ga) {
            console.info("state: default.profile");
            //if we're missing our auth token info.. user may have hit refresh here..
            //since we've just lost all our context, send them back to the start..
            //mebbe can make this nicer ;p
            if(typeof user.profile.name === 'undefined'){
              console.log("Missing auth info.. redirecting.. ");
              $state.go('default.login');
            }else{
              go_ga.hit('profile');
              console.log("default.profile.onEnter has this ", user.profile.name, auth);
            }
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
          templateUrl: 'play.html',
          controller: 'PlayCtrl as play',
          resolve: {
            // a fictional var that we'll have injected to onEntry and into the PlayCtrl.
            // resolve will make sure we don't create PlayCtrl or enter onEntry until
            // the promises below are all complete.
            "userAndAuth" : function(auth,user,$state) {
              return auth.getAuthenticationState().then(function(isAuthenticated){
                if(!isAuthenticated){
                  $state.go('default.login');
                }else{
                  if(typeof user.profile._id === 'undefined'){
                    $state.go('default.usersetup');
                  }
                }
              });
            }
          },
          onEnter: function($state, auth, user, userAndAuth){
            console.log("In play state", user, auth, userAndAuth);
          }
        })
        .state('play.room', {
          url: '',
          templateUrl: 'play.room.html',
          onEnter: function(go_ga){
            go_ga.hit('game_screen');
            go_ga.report('send','event','GameOn','App','play');
          }
        })
        .state('play.myrooms', {
          url: '/myrooms',
          templateUrl: 'play.myrooms.html',
          onEnter: function(go_ga){
            go_ga.hit('room_editor');
            go_ga.report('send','event','GameOn','App','edit_rooms');
          }
        })
        .state('play.me', {
          url: '/me',
          templateUrl: 'play.me.html',
          onEnter: function(go_ga, user){
            user.refresh();
            go_ga.hit('profile_editor');
            go_ga.report('send','event','GameOn','App','edit_profile');
          }
        });
    }
  ]);
