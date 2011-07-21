(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.Universe = (function() {
    Universe.create3DVector = function() {
      return {
        x: 0,
        y: 0,
        z: 0
      };
    };
    Universe.create2DVector = function() {
      return {
        x: 0,
        y: 0
      };
    };
    function Universe(params) {
      var universeObject, _i, _len, _ref;
      if (params == null) {
        params = {};
      }
      this.framerate = params.framerate || 100;
      this.gravity = params.gravity || -10;
      this.scale = params.scale || 40;
      this.vacuum = params.vacuum || false;
      this.world = params.world || null;
      this.objects = [];
      if ((params.objects != null) && params.objects.length > 0) {
        _ref = params.objects;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          universeObject = _ref[_i];
          this.addObject(universeObject);
        }
      }
      this.time = new UniverseTimer(this);
      this.run();
    }
    Universe.prototype.run = function() {
      this.moveObjects();
      return this.time.advance();
    };
    Universe.prototype.addObject = function(universeObject) {
      universeObject.useScale(this.scale).useWorld(this.world);
      return this.objects.push(universeObject);
    };
    Universe.prototype.moveObjects = function() {
      var object, _i, _len, _ref, _results;
      _ref = this.objects;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        object.acceleration.y = this.gravity;
        object.velocity.y += object.acceleration.y * this.time.dt;
        object.x(object.x() + object.velocity.x * this.time.dt);
        object.y(object.y() + object.velocity.y * this.time.dt);
        object.z(object.z() + object.velocity.z * this.time.dt);
        object.element.style.left = "" + (object.position.x * this.scale) + "px";
        _results.push(object.element.style.top = "" + (object.position.y * this.scale) + "px");
      }
      return _results;
    };
    return Universe;
  })();
  this.UniverseTimer = (function() {
    function UniverseTimer(universe) {
      this.universe = universe;
      this.count = 0;
      this.dt = 0;
      this.last = 0;
    }
    UniverseTimer.prototype.advance = function() {
      var currentTime;
      setTimeout((__bind(function() {
        return this.universe.run();
      }, this)), 1000 / this.universe.framerate);
      currentTime = new Date().getTime() / 1000;
      if (this.count > 0) {
        this.dt = currentTime - this.last;
      }
      this.last = currentTime;
      return this.count++;
    };
    return UniverseTimer;
  })();
  this.UniverseObject = (function() {
    function UniverseObject(params) {
      if (params == null) {
        params = {};
      }
      this.element = params.element || null;
      this.mass = params.mass || 10;
      this.width = params.width || 16;
      this.height = params.height || 16;
      this.position = params.position || Universe.create3DVector();
      this.velocity = params.velocity || Universe.create3DVector();
      this.acceleration = params.acceleration || Universe.create3DVector();
      this._scale = null;
      this._world = null;
    }
    UniverseObject.prototype.belongsToUniverse = function() {
      return this._universe != null;
    };
    UniverseObject.prototype.useScale = function(scale) {
      var dimension, value, _ref;
      if (scale !== this._scale) {
        this._scale = scale;
        _ref = this.position;
        for (dimension in _ref) {
          value = _ref[dimension];
          this.position[dimension] = value / this._scale;
        }
      }
      return this;
    };
    UniverseObject.prototype.useWorld = function(world) {
      this._world = world;
      return this;
    };
    UniverseObject.prototype.x = function(x) {
      if (x != null) {
        this.position.x = x;
      }
      return this.position.x;
    };
    UniverseObject.prototype.y = function(y) {
      if (y != null) {
        this.position.y = this._world.clientHeight - y;
      }
      return this._world.clientHeight - this.position.y;
    };
    UniverseObject.prototype.z = function(z) {
      if (z != null) {
        this.position.z = z;
      }
      return this.position.z;
    };
    return UniverseObject;
  })();
}).call(this);