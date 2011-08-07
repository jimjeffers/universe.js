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
      this.framerate = params.framerate || 40;
      this.interval = params.interval || 0.2;
      this.gravity = params.gravity || -10;
      this.scale = params.scale || 10;
      this.vacuum = params.vacuum || false;
      this.space = params.space || null;
      this.stopped = true;
      this.listening = false;
      this.objects = [];
      if ((params.objects != null) && params.objects.length > 0) {
        _ref = params.objects;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          universeObject = _ref[_i];
          this.addObject(universeObject);
        }
      }
      this.time = new UniverseTimer(this);
      if (typeof Capabilities !== "undefined" && Capabilities !== null) {
        Capabilities.testBrowser();
      }
    }
    Universe.prototype.run = function() {
      if (!this.stopped) {
        if ((Capabilities.TRANSFORMS3D || Capabilities.TRANSFORMS) && (this.time.count < 2)) {
          setTimeout((__bind(function() {
            return this.run();
          }, this)), 5);
        }
        this.moveObjects();
        return this.time.advance();
      }
    };
    Universe.prototype.start = function() {
      this.stopped = false;
      return this.run();
    };
    Universe.prototype.stop = function() {
      this.stopped = true;
      return this.time.stop();
    };
    Universe.prototype.reset = function() {
      var object, _i, _len, _ref, _results;
      this.time.stop();
      _ref = this.objects;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        if (Capabilities.TRANSFORMS3D || Capabilities.TRANSFORMS) {
          this.space.style.position = "relative";
          object.element.style.left = 0;
          object.element.style.top = 0;
          object.element.style["" + Capabilities.BROWSER_PREFIX_JS + "Transition"] = "all " + this.interval + "s linear";
          if (!this.listening) {
            this.listening = true;
            object.element.addEventListener(Capabilities.TRANSITION_END_EVENT, (__bind(function() {
              return this.run();
            }, this)), false);
          }
        }
        this.transformObject(object, {
          x: object.originalPosition.x,
          y: object.originalPosition.y
        });
        object.position = object.clone(object.originalPosition);
        object.acceleration = object.clone(object.originalAcceleration);
        _results.push(object.velocity = object.clone(object.originalVelocity));
      }
      return _results;
    };
    Universe.prototype.addObject = function(universeObject) {
      this.objects.push(universeObject);
      return this.reset();
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
        _results.push(this.transformObject(object, {
          x: object.position.x,
          y: object.position.y
        }));
      }
      return _results;
    };
    Universe.prototype.transformObject = function(object, transformParams) {
      var transform;
      if (transformParams == null) {
        transformParams = {};
      }
      if (Capabilities.TRANSFORMS3D) {
        transform = "translate3d(" + (transformParams.x * this.scale) + "px," + (transformParams.y * this.scale) + "px,0)";
        transform += "scale3d(1,1,0)";
        return object.element.style["" + Capabilities.BROWSER_PREFIX_JS + "Transform"] = transform;
      } else if (Capabilities.TRANSFORMS) {
        transform = "translate(" + (transformParams.x * this.scale) + "px," + (transformParams.y * this.scale) + "px)";
        transform += "scale(1,1)";
        transform += "rotate(0deg)";
        return object.element.style["" + Capabilities.BROWSER_PREFIX_JS + "Transform"] = transform;
      } else {
        object.element.style.left = "" + (transformParams.x * this.scale) + "px";
        return object.element.style.top = "" + (transformParams.y * this.scale) + "px";
      }
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
      if (!Capabilities.TRANSFORMS && !Capabilities.TRANSFORMS3D) {
        this.timer = setTimeout((__bind(function() {
          return this.universe.run();
        }, this)), 1000 / this.universe.framerate);
      }
      currentTime = new Date().getTime() / 1000;
      if (this.count > 0) {
        this.dt = currentTime - this.last;
      }
      this.last = currentTime;
      return this.count++;
    };
    UniverseTimer.prototype.stop = function() {
      this.dt = 0;
      this.count = 0;
      this.last = 0;
      return clearTimeout(this.timer);
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
      this.acceleration.y += this.universe.gravity;
      this.originalPosition = this.clone(this.position);
      this.originalVelocity = this.clone(this.velocity);
      this.originalAcceleration = this.clone(this.acceleration);
      if (this.element === null && this.type !== null) {
        this.element = document.createElement('div');
        this.element.setAttribute('class', this.type);
        this.universe.space.appendChild(this.element);
      }
      if (this.element.style.position !== 'absolute') {
        this.element.style.position = 'absolute';
      }
      this.universe.addObject(this);
    }
    UniverseObject.prototype.x = function(x) {
      if (x != null) {
        this.position.x = x;
      }
      return this.position.x;
    };
    UniverseObject.prototype.y = function(y) {
      if (y != null) {
        return this.position.y = (this.universe.space.clientHeight / this.universe.scale) - y;
      }
      return (this.universe.space.clientHeight / this.universe.scale) - this.position.y;
    };
    UniverseObject.prototype.z = function(z) {
      if (z != null) {
        this.position.z = z;
      }
      return this.position.z;
    };
    UniverseObject.prototype.clone = function(obj) {
      var key, newInstance;
      if (!(obj != null) || typeof obj !== 'object') {
        return obj;
      }
      newInstance = new obj.constructor();
      for (key in obj) {
        newInstance[key] = this.clone(obj[key]);
      }
      return newInstance;
    };
    return UniverseObject;
  })();
}).call(this);
