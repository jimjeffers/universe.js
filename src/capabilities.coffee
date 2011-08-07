# Abstracted from Sauce.JS
# -------------------------------------------------
class @Capabilities
	# Browser Capability Testing:
	# -------------------------------------------------
	# We need to be able to determine the browser's prefix as most
	# of the features we need to perform animations are proprietary.
	# Also - we need to determine whether or not the browser supports
	# 3D or 2D transformations.

	@BROWSER_PREFIX: null
	@BROWSER_PREFIX_JS: null
	@TRANSFORMS3D: null
	@TRANSFORMS: null
	@TRANSITION_END_EVENT: null
		
	@testBrowser: ->
		# Browser Prefix:
		# -------------------------------------------------
		# First we'll get the browser prefix necessary. This is done by running
		# a regex on the userAgent property. There are a few gotchas so we have
		# a 'negator' property on the JS object that runs to cancel out any
		# false positives.
		prefixes =
			webkit:		
				condition:			/webkit/
				jsPrefix: 			"Webkit"
				transitionEnd:	"webkitTransitionEnd"
			o:		
				condition:			/opera/
				jsPrefix: 			"O"
				transitionEnd:	"oTransitionEnd"
			ms:
				condition:			/msie/
				negator:				/opera/
				jsPrefix:				"ms"
				transitionEnd:	"msTransitionEnd"
			moz:	
				condition:			/mozilla/
				negator:				/(compatible|webkit)/
				jsPrefix:				"Moz"
				transitionEnd:	"transitionend"
		userAgent = navigator.userAgent.toLowerCase()
		
		for prefix, options of prefixes
			if options.condition.test(userAgent)
				unless options.negator? and options.negator.test(userAgent)
					@BROWSER_PREFIX = prefix
					@BROWSER_PREFIX_JS = options.jsPrefix
					@TRANSITION_END_EVENT = options.transitionEnd
		# Transform Types:
		# -------------------------------------------------
		# Simple test for transforms or 3D transforms inspired by modernizr.
		# See: https://github.com/Modernizr/Modernizr/blob/master/modernizr.js#L594
		style = document.createElement('test').style
		features =
			transform3d: ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']
			transform: ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']
		for name, properties of features
			for property in properties
				unless style[property] == undefined
					if name == "transform3d" then @TRANSFORMS3D = true
					if name == "transform" then @TRANSFORMS = true