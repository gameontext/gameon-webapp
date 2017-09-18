'use strict';

describe('SiteCtrl controller test', function () {
  var $controller,
    $log;

  beforeEach(module('playerApp'));

  beforeEach(angular.mock.module({
    'user' : {
      profile: {
        _id: 1,
        credentials: {
          sharedSecret: 'x'
        }
      }
    }
  }));

  beforeEach(inject(function (_$controller_, _$log_) {
    $log = _$log_;
    $controller = _$controller_;
  }));

  describe('.createConnectionSecret()', function() {
    var controller;

    beforeEach(function() {
      controller = $controller('SiteCtrl', {  });
    });

    // A simple test to verify the method all exists
    it('should exist', function() {
      expect(controller.createConnectionSecret).toBeDefined();
    });

    it('should generate a 32-byte string', function() {
      expect(controller.createConnectionSecret).toBeDefined();
      controller.createConnectionSecret();
      expect(controller.activeSite.info.connectionDetails.token).toMatch(/[A-Za-z0-9]{32}/);
    });
  });

});
