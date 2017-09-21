'use strict';

describe('SiteCtrl controller test', function () {
  var controller,
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

  beforeEach(inject(function ($controller, _$log_) {
    $log = _$log_;
    controller = $controller('SiteCtrl', {  });
  }));

  describe('.createConnectionSecret()', function() {

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

  describe('.slugify', function() {

    it('should convert "A Long Name" to "a-long-name"', function() {
      controller.activeSite = {
        info: {}
      };
      expect(controller.activeSite.info.fullName).not.toBeDefined();
      expect(controller.activeSite.info.name).not.toBeDefined();

      controller.activeSite.info.fullName = 'A Long Name';
      controller.slugify();

      expect(controller.activeSite.info.fullName).toEqual('A Long Name');
      expect(controller.activeSite.info.name).toEqual('a-long-name');
    });
  });

});
