class @Universe
	@create3DVector: ->
		x: 0
		y: 0
		z: 0
	@create2DVector: ->
		x: 0
		y: 0
	
	constructor: (params={}) ->
		@framerate	= params.framerate	||	40		# frames per second if using DOM for position.
		@interval		= params.interval		|| 	0.2		# Transition duration if using transform engine.
		@gravity		= params.gravity		|| -10		# meters per second per second
		@scale			= params.scale			||	10		# pixels per meter
		@vacuum			= params.vacuum			||	false	# TODO: air resistance
		@space			= params.space			||	null	# Find space.
		@stopped		= true
		@listening	= false
		@objects		= []
		
		# If user supplied an objects array on init we'll
		# configure and push them via the convenience method.
		if params.objects? and params.objects.length > 0
			for universeObject in params.objects
				@addObject(universeObject)
		
		@time = new UniverseTimer(this)
		
		if Capabilities?
			Capabilities.testBrowser()
	
	run: ->
		unless @stopped
			# This is necessary to ensure a transition occurs. Otherwise there will never be any initial
			# movement and thus the event listener on the transition will never get called.
			if (Capabilities.TRANSFORMS3D or Capabilities.TRANSFORMS) and (@time.count < 2)
				setTimeout(( =>
					@run()
				),5)
			@moveObjects()
			@time.advance()
	
	start: ->
		@stopped = false
		@run()
		
	stop: ->
		@stopped = true
		@time.stop()
	
	reset: ->
		@time.stop()
		for object in @objects
			if Capabilities.TRANSFORMS3D or Capabilities.TRANSFORMS
				@space.style.position = "relative"
				object.element.style.left = 0
				object.element.style.top = 0
				object.element.style["#{Capabilities.BROWSER_PREFIX_JS}Transition"] = "all #{@interval}s linear"
				# This way we only listen to one object.
				unless @listening
					@listening = true
					object.element.addEventListener(Capabilities.TRANSITION_END_EVENT, ( =>
						@run()
					), false)
				
			@transformObject(object,{
				x: object.originalPosition.x
				y: object.originalPosition.y
			})
			object.position = object.clone(object.originalPosition)
			object.acceleration = object.clone(object.originalAcceleration)
			object.velocity = object.clone(object.originalVelocity)
	
	addObject: (universeObject) ->
		@objects.push(universeObject)
		@reset()
	
	moveObjects: ->
		for object in @objects
			object.velocity.x += object.acceleration.x * @time.dt	# v = a * dt
			object.velocity.y += object.acceleration.y * @time.dt	# v = a * dt
			object.velocity.z += object.acceleration.z * @time.dt	# v = a * dt
			
			object.x(object.x() + object.velocity.x * @time.dt)		# x = x_old + dx
			object.y(object.y() + object.velocity.y * @time.dt)		# y = y_old + dy
			object.z(object.z() + object.velocity.z * @time.dt)		# z = z_old + dz
			
			@transformObject(object,{
				x: object.position.x
				y: object.position.y
			})
			
	transformObject: (object,transformParams={}) ->
		if Capabilities.TRANSFORMS3D
			transform = "translate3d(#{transformParams.x*@scale}px,#{transformParams.y*@scale}px,0)"
			transform += "scale3d(1,1,0)"
			object.element.style["#{Capabilities.BROWSER_PREFIX_JS}Transform"] = transform
		else if Capabilities.TRANSFORMS
			transform = "translate(#{transformParams.x*@scale}px,#{transformParams.y*@scale}px)"
			transform += "scale(1,1)"
			transform += "rotate(0deg)"
			object.element.style["#{Capabilities.BROWSER_PREFIX_JS}Transform"] = transform
		else
			object.element.style.left = "#{transformParams.x*@scale}px"
			object.element.style.top = "#{transformParams.y*@scale}px"
			# TODO: scale object for z-axis movement
			
class @UniverseTimer
	constructor: (@universe) ->
		@count	= 0
		@dt		= 0
		@last	= 0
	
	advance: ->
		if !Capabilities.TRANSFORMS and !Capabilities.TRANSFORMS3D
			@timer = setTimeout(( => # Fat arrow binds 'this' to the current Universe object to the function called by setTimeout 
				@universe.run()
			), 1000/@universe.framerate)
		currentTime = new Date().getTime() / 1000 # current time in seconds.
		if @count > 0
			@dt = currentTime - @last
		@last = currentTime
		@count++
	
	stop: ->
		@dt 		= 0
		@count 	= 0
		@last 	= 0
		clearTimeout(@timer)
	
class @UniverseObject
	constructor: (params={}) ->
		@element		= params.element				|| null
		@type				= params.type						|| null
		@mass				= params.mass						|| null
		@width			= params.width					|| null
		@height			= params.height					|| null
		@position		= params.position				|| Universe.create3DVector()
		@velocity		= params.velocity				|| Universe.create3DVector()
		@acceleration	= params.acceleration	|| Universe.create3DVector()
		@universe		= params.universe				|| null
		
		# Private Vars
		@_scale = null
		
		# Add acceleration
		@acceleration.y += @universe.gravity
		
		# Keep original values for reset
		@originalPosition = @clone(@position)
		@originalVelocity = @clone(@velocity)
		@originalAcceleration = @clone(@acceleration)
		
		# Create element if not supplied
		if @element is null and @type isnt null
			@element = document.createElement('div')
			# for now, set a class to the element until automatic styling
			@element.setAttribute('class', @type)
			@universe.space.appendChild(@element)
		
		if @element.style.position isnt 'absolute'
			@element.style.position = 'absolute'
		
		@universe.addObject(this)
	
	x: (x) ->
		if x?
			@position.x = x
		@position.x
	
	y: (y) ->
		if y?
			return @position.y = (@universe.space.clientHeight/@universe.scale) - y
		
		(@universe.space.clientHeight/@universe.scale) - @position.y
	
	z: (z) ->
		if z?
			@position.z = z
		@position.z
	
	clone: (obj) ->
		if not obj? or typeof obj isnt 'object'
			return obj
		
		newInstance = new obj.constructor()
		
		for key of obj
			newInstance[key] = @clone obj[key]
		
		return newInstance