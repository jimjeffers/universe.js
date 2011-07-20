(function() {
  describe("Universe", function() {
    var universe;
    universe = null;
    beforeEach(function() {
      return universe = new Universe();
    });
    it("should exist!", function() {
      return expect(universe != null).toBeTruthy();
    });
    return it("should be a universe", function() {
      return expect(universe).toBeAnInstanceOf(Universe);
    });
  });
}).call(this);
