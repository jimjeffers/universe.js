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
    this.scale = params.scale || 10;
    this.vacuum = params.vacuum || false;
    this.space = params.space || null;
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
    universeObject.useScale(this.scale);
    universeObject.acceleration.y += this.gravity;
    return this.objects.push(universeObject);
  };
  Universe.prototype.moveObjects = function() {
    var object, _i, _len, _ref, _results;
    _ref = this.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      object.velocity.x += object.acceleration.x * this.time.dt;
      object.velocity.y += object.acceleration.y * this.time.dt;
      object.velocity.z += object.acceleration.z * this.time.dt;
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
    this.type = params.type || null;
    this.mass = params.mass || null;
    this.width = params.width || null;
    this.height = params.height || null;
    this.position = params.position || Universe.create3DVector();
    this.velocity = params.velocity || Universe.create3DVector();
    this.acceleration = params.acceleration || Universe.create3DVector();
    this.universe = params.universe || null;
    this._scale = null;
    if (this.element === null && this.type !== null) {
      this.element = document.createElement('div');
      this.element.setAttribute('class', this.type);
      this.universe.space.appendChild(this.element);
    }
    this.universe.addObject(this);
  }
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
  UniverseObject.prototype.x = function(x) {
    if (x != null) {
      this.position.x = x;
    }
    return this.position.x;
  };
  UniverseObject.prototype.y = function(y) {
    if (y != null) {
      this.position.y = this.universe.space.clientHeight - y;
    }
    return this.universe.space.clientHeight - this.position.y;
  };
  UniverseObject.prototype.z = function(z) {
    if (z != null) {
      this.position.z = z;
    }
    return this.position.z;
  };
  return UniverseObject;
})();