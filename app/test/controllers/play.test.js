'use strict';

describe('PlayCtrl controller test', function () {
  var $controller,
    $log,
    $window,
    document;

  beforeEach(module('playerApp'));

  beforeEach(angular.mock.module({
    'userAndAuth' : {}
  }));

  beforeEach(inject(function (_$controller_, _$log_, _$window_) {
    $log = _$log_;
    $controller = _$controller_;

    $window = _$window_;
    document = $window.document;

    spyOn(document, "getElementById").and.callFake(function() {
      return {
          focus: function() { return true; }
      };
    });
  }));

  describe('.createConnectionSecret()', function() {
    var controller;

    beforeEach(function() {
      controller = $controller('PlayCtrl', {  });
    });

    // A simple test to verify the method all exists
    it('should exist', function() {
      expect(controller.createConnectionSecret).toBeDefined();
    });

    it('should generate a 32-byte string', function() {
      var result = controller.createConnectionSecret();
      expect(result).toMatch(/[A-Za-z0-9]{32}/);
    });
  });

});
