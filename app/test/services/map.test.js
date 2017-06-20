'use strict';

describe('map registration client', function () {
  var map;
  var $httpBackend,
      $state,
      $rootScope,
      $q;

  var mapurl = '/map/v1/sites';  //where to get the data from

  beforeEach(module('playerApp'));

  beforeEach(angular.mock.module({
    'user': {
      profile: {
        _id : 'test_id',
        credentials : {
          sharedSecret : 'crazy"'
        }
      }
    },
    '$state': {
    }
  }));

  beforeEach(inject(function(_$httpBackend_, _$rootScope_, _$state_, _$q_, _map_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    $q = _$q_;
    map = _map_;
  }));

  afterEach(function() {
   $httpBackend.verifyNoOutstandingExpectation();
   $httpBackend.verifyNoOutstandingRequest();
  });

  // A simple test to verify the Map factory exists
  it('is defined', function() {
    expect(map).toBeDefined();
  });

  // getSitesForUser returns a promise...
  describe('.getSitesForUser()', function() {
    // A simple test to verify the method all exists
    it('should exist', function() {
      expect(map.getSitesForUser).toBeDefined();
    });

    it('tolerates no content', function() {
      $httpBackend.expectGET(mapurl + '?owner=test_id').respond(204);

      var result;
      map.getSitesForUser().then(function(value) { result = value; });

      $httpBackend.flush(); // make the pretend http request
      $rootScope.$apply();  // resolve the promise
      expect(result).toEqual([]);
    });

    it('tolerates errors', function() {
      $httpBackend.expectGET(mapurl + '?owner=test_id').respond(500);

      var result;
      map.getSitesForUser().then(function(value) { result = value; });

      $httpBackend.flush(); // make the pretend http request
      $rootScope.$apply();  // resolve the promise
      expect(result).toEqual([]);
    });

    it('reads json response data', function() {
      $httpBackend.expectGET(mapurl + '?owner=test_id').respond(200,'[{},{}]');

      var result;
      map.getSitesForUser().then(function(value) { result = value; });

      $httpBackend.flush(); // make the pretend http request
      $rootScope.$apply();  // resolve the promise
      expect(result).toEqual([{},{}]);
    });

    it('tolerates bad json response data', function() {
      $httpBackend.expectGET(mapurl + '?owner=test_id').respond(200);

      var result;
      map.getSitesForUser().then(function(value) { result = value; });

      $httpBackend.flush(); // make the pretend http request
      $rootScope.$apply();  // resolve the promise
      expect(result).toEqual([]);
    });

  });

});
