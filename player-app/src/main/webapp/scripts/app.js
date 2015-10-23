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
      console.log("Page init starting.");

      // make life easier
      $rootScope.$on("$stateChangeError", console.log.bind(console));

      // From https://github.com/angular-ui/ui-router/blob/gh-pages/sample/app/app.js
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      
      console.log("Page init complete");
    }
  ])
  .constant("API", {
    "PROFILE_URL": "https://"+window.location.host+"/play/players/",
    "WS_URL": "wss://"+window.location.host+"/play/ws1/",
    "VERIFY_URL": "https://"+window.location.host+"/play/auth/verify/",
    "INTROSPECT_URL": "https://"+window.location.host+"/play/auth/introspect/",
    "JWT_URL": "https://"+window.location.host+"/play/auth/jwt/",
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
        })
        .state('default.auth', {
          url: '^/login/callback/{token:.*}',

          // State triggered by authentication callback (only). 
          onEnter: function($state, $stateParams, auth, user) {
            // this step has to read the token from the params passed ($stateParams.token)
            // and cause it to be stashed into the auth object so we can rely on it going forwards.

            console.log("default.auth.onEnter - calling auth.validate_token");
            auth.validate_token($stateParams.token).then(function(isValid) {
              // Verify the returned token... 
              if(isValid){
                console.log("token callback from auth service was valid");
                $state.go('default.usersetup');
              }else{
                //TODO: goto a login failed page.. 
                $state.go('default.login');
              }
            });        	
          }
        })
        .state('default.usersetup', { 
          url: '^/login/usersetup',
          // Triggered by default.auth state. 
          onEnter: function($state, $stateParams,auth,user) {
            console.log("building user object");
            auth.introspect_token().then(function(tokeninfo) {
              if(tokeninfo.valid){
                // Verify the returned token... 
                console.log("cached/recovered token was valid, token info object was");
                console.log(tokeninfo);

                //user.load returns a promise that resolves to true if the user was found.. false otherwise. 
                user.load(tokeninfo.id, tokeninfo.name).then(function(userKnownToDB){
                  if(userKnownToDB){
                    $state.go('play.room');
                  }else{
                    $state.go('default.profile');  
                  }
                });
              }else{
                //cached / recovered token was invalid. 
                //TODO: goto a login failed page.. 
                $state.go('default.login');
              }
            });
          }
        })
        .state('default.profile', { // initial profile creation
          url: '^/login/profile',
          onEnter: function($state, $stateParams, user, auth) {        	  
            //if we're missing our auth token info.. user may have hit refresh here.. 
            //since we've just lost all our context, send them back to the start..
            //mebbe can make this nicer ;p
            if(typeof user.profile.name === 'undefined'){
              console.log("Missing auth info.. redirecting.. ");
              $state.go('default.login');
            }else{
              console.log("default.profile.onEnter has this ");
              console.log(user.profile.name);
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
          templateUrl: 'templates/play.html',
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
                  if(typeof user.profile.id === 'undefined'){
                    $state.go('default.usersetup');
                  }
                }
              });
            }
          },
          onEnter: function($state, auth, user, userAndAuth){
            console.log("In play state");
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

