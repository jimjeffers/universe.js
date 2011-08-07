(function() {
  this.Capabilities = (function() {
    function Capabilities() {}
    Capabilities.BROWSER_PREFIX = null;
    Capabilities.BROWSER_PREFIX_JS = null;
    Capabilities.TRANSFORMS3D = null;
    Capabilities.TRANSFORMS = null;
    Capabilities.TRANSITION_END_EVENT = null;
    Capabilities.testBrowser = function() {
      var features, name, options, prefix, prefixes, properties, property, style, userAgent, _results;
      prefixes = {
        webkit: {
          condition: /webkit/,
          jsPrefix: "Webkit",
          transitionEnd: "webkitTransitionEnd"
        },
        o: {
          condition: /opera/,
          jsPrefix: "O",
          transitionEnd: "oTransitionEnd"
        },
        ms: {
          condition: /msie/,
          negator: /opera/,
          jsPrefix: "ms",
          transitionEnd: "msTransitionEnd"
        },
        moz: {
          condition: /mozilla/,
          negator: /(compatible|webkit)/,
          jsPrefix: "Moz",
          transitionEnd: "transitionend"
        }
      };
      userAgent = navigator.userAgent.toLowerCase();
      for (prefix in prefixes) {
        options = prefixes[prefix];
        if (options.condition.test(userAgent)) {
          if (!((options.negator != null) && options.negator.test(userAgent))) {
            this.BROWSER_PREFIX = prefix;
            this.BROWSER_PREFIX_JS = options.jsPrefix;
            this.TRANSITION_END_EVENT = options.transitionEnd;
          }
        }
      }
      style = document.createElement('test').style;
      features = {
        transform3d: ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'],
        transform: ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']
      };
      _results = [];
      for (name in features) {
        properties = features[name];
        _results.push((function() {
          var _i, _len, _results2;
          _results2 = [];
          for (_i = 0, _len = properties.length; _i < _len; _i++) {
            property = properties[_i];
            _results2.push(style[property] !== void 0 ? (name === "transform3d" ? this.TRANSFORMS3D = true : void 0, name === "transform" ? this.TRANSFORMS = true : void 0) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    return Capabilities;
  })();
}).call(this);
