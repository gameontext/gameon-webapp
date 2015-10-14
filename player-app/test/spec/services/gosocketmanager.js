'use strict';

describe('Service: goSocketManager', function () {

  // load the service's module
  beforeEach(module('playerApp'));

  // instantiate service
  var goSocketManager;
  beforeEach(inject(function (_goSocketManager_) {
    goSocketManager = _goSocketManager_;
  }));

  it('should do something', function () {
    expect(!!goSocketManager).toBe(true);
  });

});
