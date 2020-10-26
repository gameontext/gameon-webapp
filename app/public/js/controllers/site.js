'use strict';

angular.module('playerApp')
  .controller('SiteCtrl',
  [       '$log','$window', 'user', 'map',
  function($log,  $window,   user,   map) {
    $log.debug('MAP : controller %o and %o', user, map);

    // Reference to this for use in promises
    var siteCtrl = this;

    //list of rooms registered to this ID
    this.siteList = [];

    this.getSites = function() {
      map.getSitesForUser().then(function(response) {
        $log.debug('MAP : getSitesForUser %o', response);
        siteCtrl.siteList = response;
      });
    };

    this.createRoom = function() {
      $log.debug("createRoom %o %o", siteCtrl.roomConfig, siteCtrl.activeSite);
      delete this.errors;

      // this.activeSite will be null if the form contains an error
      if ( siteCtrl.activeSite ) {
        map.createSiteForUser(siteCtrl.activeSite).then(function(response) {
          $log.debug('createRoom: OK %o', response);
          siteCtrl.activeSite = response;
          siteCtrl.siteList.push(response);
        }, function(response) {
          $log.debug('createRoom FAILED %o', response);
          if ( !siteCtrl.errors ) {
            siteCtrl.errors = [];
          }
          siteCtrl.errors.push(response);
          if ( response.status === 409 ) {
            // conflict on save, which would mean a conflict with the
            // name field, as that should be unique.
            delete siteCtrl.activeSite.info.name;
          }
        });
      }
    };

    this.deleteRoom = function() {
      $log.debug("deleteRoom %o", siteCtrl.activeSite);
      if ( siteCtrl.activeSite ) {
        map.deleteSiteForUser(siteCtrl.activeSite).then(function(response) {
          $log.debug('deleteRoom OK %o', response);
          delete siteCtrl.activeSite;
          // TODO: remove element with matching id
          siteCtrl.resetForm();
          siteCtrl.getSites();
        }, function(response) {
          $log.debug('deleteRoom FAILED %o', response);

        });
      }
    };

    this.updateRoom = function() {
      $log.debug("updateRoom %o", siteCtrl.activeSite);
      if ( siteCtrl.activeSite ) {
        map.updateSiteForUser(siteCtrl.activeSite).then(function(response) {
          $log.debug('updateRoom OK %o', response);
          siteCtrl.resetForm();
        }, function(response) {
          $log.debug('updateRoom FAILED %o', response);
        });
      }
    };

    this.resetForm = function() {
      $log.debug("resetForm %o", this.activeSite);
      this.roomConfig.$setPristine();
    };

    this.slugify = function() {
      $log.debug("slugify %o %o", siteCtrl.roomConfig, siteCtrl.activeSite);
      var text = this.activeSite.info.fullName;
      if( angular.isUndefined(this.activeSite.info.name) || this.activeSite.info.name === '') {
        this.activeSite.info.name = text.toString().toLowerCase().trim()
            .replace(/&/g, '-and-')         // Replace & with 'and'
            .replace(/[\s\W-]+/g, '-');     // Replace spaces, non-word characters and dashes with a single dash (-)
      }
    };

    this.createConnectionSecret = function( ) {
      var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var i;
      var result = "";
      var length = 32;
      if($window.crypto && $window.crypto.getRandomValues) {
        var values = new Uint32Array(length);
        $window.crypto.getRandomValues(values);
        for(i=0; i < length; i++) {
            result += charset[values[i] % charset.length];
        }
      } else {
        for(i=0; i<length; i++) {
          result += charset[Math.floor(Math.random()*charset.length)];
        }
      }
      if ( !siteCtrl.activeSite ) {
        siteCtrl.activeSite = {};
      }
      if ( !siteCtrl.activeSite.info ) {
        siteCtrl.activeSite.info = {};
      }
      if ( !siteCtrl.activeSite.info.connectionDetails ) {
        siteCtrl.activeSite.info.connectionDetails = {};
      }
      $log.debug("createConnectionSecret %o %o", siteCtrl.roomConfig, siteCtrl.activeSite);
      siteCtrl.activeSite.info.connectionDetails.token = result;
    };

    // Trigger initial load of user sites
    this.getSites();
}]);
