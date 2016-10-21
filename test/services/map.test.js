describe('map', function () {
  beforeEach(function() {
    module('playerApp')
  });

  var map;
  beforeEach(inject(function(_map_) {
    map = _map_;
  }));

  it('is defined', function() {
    expect(map).toBeDefined();
  });

  describe('getSitesForUser', function() {
    it('is benign on empty', function() {
      var sites = map.getSitesForUser();
      expect(sites).toBe(empty);
    });

    it('is benign on empty', function() {
      var sites = map.getSitesForUser();
      expect(sites).toBe(empty);
    });

  });
});
