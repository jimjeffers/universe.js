(function() {
  beforeEach(function() {
    return this.addMatchers({
      toBeAnInstanceOf: function(param) {
        var current;
        current = this.actual;
        return current instanceof param;
      }
    });
  });
}).call(this);
