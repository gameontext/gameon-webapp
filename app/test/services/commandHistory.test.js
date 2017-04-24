'use strict';

describe('commandHistory', function () {
  beforeEach(function() {
    module('playerApp');
  });

  var commandHistory;
  beforeEach(inject(function(_commandHistory_) {
    commandHistory = _commandHistory_;
  }));

  it('is defined', function() {
    expect(commandHistory).toBeDefined();
  });

  describe('prev', function() {
    it('is benign on empty', function() {
      var cmd = commandHistory.prev();
      expect(cmd).toBe(null);
    });

    it('works with single entry', function() {
      commandHistory.push("/something");

      var cmd = commandHistory.prev();

      expect(cmd).toBe("/something");
    });

    it('does not go back beyond oldest', function() {
      commandHistory.push("/something");

      var cmd = commandHistory.prev();
      cmd = commandHistory.prev();

      expect(cmd).toBe("/something");
    });

    it('is not confused by going back beyond oldest', function() {
      commandHistory.push("/something");

      var cmd = commandHistory.prev();
      cmd = commandHistory.prev();
      expect(cmd).toBe("/something");

      cmd = commandHistory.next();
      expect(cmd).toBe(null);
    });

    it('works with multiple entries', function() {
      commandHistory.push("/something1");
      commandHistory.push("/something2");

      var cmd = commandHistory.prev();
      expect(cmd).toBe("/something2");

      cmd = commandHistory.prev();
      expect(cmd).toBe("/something1");

      cmd = commandHistory.prev();
      expect(cmd).toBe("/something1");
    });
  });

  describe('next', function() {
    it('is benign on empty', function() {
      var cmd = commandHistory.next();
      expect(cmd).toBe(null);
    });

    it('is benign before moving back', function() {
      commandHistory.push("/something");
      var cmd = commandHistory.next();
      expect(cmd).toBe(null);
    });
  });
});
