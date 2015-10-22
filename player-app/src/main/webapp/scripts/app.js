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
  [          '$rootScope', '$state', '$stateParams', 'auth', 'user',
    function ($rootScope,   $state,   $stateParams, auth, user) {
	  console.log("Page init starting.");
	  
      // make life easier
      $rootScope.$on("$stateChangeError", console.log.bind(console));

      // From https://github.com/angular-ui/ui-router/blob/gh-pages/sample/app/app.js
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      
      //
      
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
    function ($stateProvider,  $urlRouterProvider, auth, user) {
    
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
          controller: 'DefaultCtrl as default',
          params : {
        	  'auth' : auth,
        	  'user' : user
          },
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
          
          onEnter: function($state, $stateParams,auth,user) {
        	  //this step has to read the token from the params passed ($stateParams.token)
        	  //and cause it to be stashed into the auth object so we can rely on it going forwards.
        	  
        	  console.log("default.auth.onEnter");
        	  
        	  console.log("default.auth.onEnter - calling auth.validate_token");
        	  auth.validate_token($stateParams.token).then(function(isValid) {
	        	   if(isValid){
		             // Triggered by authentication callback (only). 
		             // Verify the returned token... 
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
           onEnter: function($state, $stateParams,auth,user) {
        	  console.log("building user object");
         	  auth.introspect_token().then(function(tokeninfo) {
	        	   if(tokeninfo.valid){
		             // Triggered by authentication callback (only). 
		             // Verify the returned token... 
	                 console.log("cached/recovered token was valid, token info object was");
	                 console.log(tokeninfo);
	                 
		              //user.load returns a promise that resolves to true if the user was found.. false otherwise. 
		              user.load(tokeninfo.id, tokeninfo.name).then(function(userKnownToDB){
		            	  if(userKnownToDB){
		            	      $state.go('play.room');
		            	  }else{
		 	                 $state.go('default.profile',{ tokeninfo : data});  
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
        .state('default.profile', { // check profile or initial profile creation
           url: '^/login/profile',
           onEnter: function($state, $stateParams,auth,user) {        	 
        	  //if we're missing our auth token info.. user may have hit refresh here.. 
        	  //since we've just lost all our context, send them back to the start..
        	  //mebbe can make this nicer ;p
        	  if($stateParams.tokeninfo === null){
        		  console.log("Missing auth info.. redirecting.. ")
        		  $state.go('default.login');
        	  }else{        		  
	              console.log("default.profile.onEnter has this ");
	              console.log($stateParams.tokeninfo);	             
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
          onEnter: function($state, auth, user){
        	console.log("AUTHING ROOM");

            auth.getAuthenticationState().then(function(isAuthenticated){
            	if(!isAuthenticated){
            		$state.go('default.login');           	
            	}else{
            		console.log("room is authed.");	
                	if(typeof user.profile.id === 'undefined'){
                		console.log("user is missing .. rebuilding");
                		$state.go('default.usersetup');
                	}
            	}
            });
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

