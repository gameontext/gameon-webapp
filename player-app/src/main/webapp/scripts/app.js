'use strict';

/**
 * @ngdoc overview
 * @name playerApp
 * @description
 * # playerApp
 *
 * Main module of the application.
 */
angular
  .module('playerApp', [
      'ngResource',
      'ngSanitize',
      'ui.router',
      'ngWebSocket'
  ])
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
  .config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {

      //////////////////////////
      // OAuth Configurations (define functions the state provider needs to 
      // check for auth state up front)
      // e.g. https://github.com/sahat/satellizer/blob/master/examples/client/app.js 

//    function skipIfLoggedIn($q, $auth) {
      function skipIfLoggedIn($q) {
        var deferred = $q.defer();
        //if ($auth.isAuthenticated()) {
        //  deferred.reject();
        //} else {
          deferred.resolve();
        //}
        return deferred.promise;
      }

//    function loginRequired($q, $location, $auth) {
      function loginRequired($q) {
        var deferred = $q.defer();
        //if ($auth.isAuthenticated()) {
          deferred.resolve();
        //} else {
        //  $location.path('/login'); // redirect
        //}
        return deferred.promise;
      }
      
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
            resolve: {
                skipIfLoggedIn: skipIfLoggedIn
              }
        })
        .state('play', {
            // With abstract set to true, that means this state can not be explicitly activated.
            // It can only be implicitly activated by activating one of its children.
            abstract: true,
            url: '/play',
            templateUrl: 'templates/play.html',
            resolve: {
                loginRequired: loginRequired
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
