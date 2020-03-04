'use strict';

describe('Room Editing', function () {
  var $scope, roomConfig, siteInfo, compiled;

  beforeEach(module('playerApp'));
  beforeEach(module('templates'));

  beforeEach(inject(function ($rootScope, $templateCache, $compile, $q, map) {
    spyOn(map, 'getSitesForUser').and.returnValue($q.when([]));
    $scope = $rootScope;

    $scope.sites = {
      activeSite: {
        info: {
          connectionDetails: {}
        }
      }
    };

    // Fish the form out of template
    var element = angular.element($templateCache.get('/play.myrooms.html'));
    var forms = element.find('form');
    expect(forms.length).toBe(1);

    // Compile the form
    var form = forms[0];
    compiled = $compile(form)($scope);
    roomConfig = $scope.sites.roomConfig;
    siteInfo = $scope.sites.activeSite.info;
  }));

  describe('Room attributes', function() {

    describe("Repository URL", function() {
      it('Repo URL should allow http', function() {
        expect(siteInfo.repositoryUrl).not.toBeDefined();
        roomConfig.ri_repo.$setViewValue('http://something.com');
        $scope.$digest();
        expect(roomConfig.ri_repo.$valid).toBe(true);
        expect(siteInfo.repositoryUrl).toEqual('http://something.com');
      });
      it('Repo URL should not allow garbage', function() {
        expect(siteInfo.repositoryUrl).not.toBeDefined();
        roomConfig.ri_repo.$setViewValue('garbage');
        $scope.$digest();
        expect(roomConfig.ri_repo.$valid).toBe(false);
        expect(siteInfo.repositoryUrl).not.toBeDefined();
      });
    });
  });

  describe('Connection details', function() {

    describe('Target', function() {
      it('URL should contain ws://', function() {
        expect(siteInfo.connectionDetails.target).not.toBeDefined();
        roomConfig.ri_cd_target.$setViewValue('ws://something.com/rooms');
        $scope.$digest();
        expect(roomConfig.ri_cd_target.$valid).toBe(true);
        expect(siteInfo.connectionDetails.target).toEqual('ws://something.com/rooms');
      });
      it('URL should contain wss://', function() {
        expect(siteInfo.connectionDetails.target).not.toBeDefined();
        roomConfig.ri_cd_target.$setViewValue('wss://something.com/rooms');
        $scope.$digest();
        expect(roomConfig.ri_cd_target.$valid).toBe(true);
        expect(siteInfo.connectionDetails.target).toEqual('wss://something.com/rooms');
      });
      it('URL should not contain garbage', function() {
        expect(siteInfo.connectionDetails.target).not.toBeDefined();
        roomConfig.ri_cd_target.$setViewValue('garbage');
        $scope.$digest();
        expect(roomConfig.ri_cd_target.$valid).toBe(false);
        expect(siteInfo.connectionDetails.target).not.toBeDefined();
      });
    });

    describe('Health URL', function() {
      it('URL should contain http', function() {
        expect(siteInfo.connectionDetails.healthUrl).not.toBeDefined();
        roomConfig.ri_cd_health.$setViewValue('http://something.com/health');
        $scope.$digest();
        expect(roomConfig.ri_cd_health.$valid).toBe(true);
        expect(siteInfo.connectionDetails.healthUrl).toEqual('http://something.com/health');
      });
      it('URL should not contain garbage', function() {
        expect(siteInfo.connectionDetails.healthUrl).not.toBeDefined();
        roomConfig.ri_cd_health.$setViewValue('garbage');
        $scope.$digest();
        expect(roomConfig.ri_cd_health.$valid).toBe(false);
        expect(siteInfo.connectionDetails.healthUrl).not.toBeDefined();
      });
    });

  });

  describe('Doors', function() {

  });

});
