'use strict';

describe('Controller: DefaultCtrl', function () {

  // load the controller's module
  beforeEach(module('playerApp'));

  var DefaultCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DefaultCtrl = $controller('DefaultCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DefaultCtrl.awesomeThings.length).toBe(3);
  });
});
