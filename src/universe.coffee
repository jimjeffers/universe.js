class @Universe
	@create3DVector: ->
		x: 0
		y: 0
		z: 0
	@create2DVector: ->
		x: 0
		y: 0
	
	constructor: (params={}) ->
		@framerate	= params.framerate	||	100		# frames per second
		@gravity	= params.gravity	|| -10		# meters per second per second
		@scale		= params.scale		||	10		# pixels per meter
		@vacuum		= params.vacuum		||	false	# TODO: air resistance
		@space		= params.space		||	null	# Find space.
		@objects	= []
		
		# If user supplied an objects array on init we'll
		# configure and push them via the convenience method.
		if params.objects? and params.objects.length > 0
			for universeObject in params.objects
				@addObject(universeObject)
		
		@time = new UniverseTimer(this)
	
	run: ->
		@moveObjects()
		@time.advance()
	
	stop: ->
		@time.stop()
	
	reset: ->
		@time.stop()
		for object in @objects
			object.element.style.left = "#{object.x(object.originalPosition.x)*@scale}px"
			object.element.style.top = "#{object.y(object.originalPosition.y)*@scale}px"
			object.acceleration = object.clone(object.originalAcceleration)
			object.velocity = object.clone(object.originalVelocity)
	
	addObject: (universeObject) ->
		@objects.push(universeObject)
	
	moveObjects: ->
		for object in @objects
			object.velocity.x += object.acceleration.x * @time.dt	# v = a * dt
			object.velocity.y += object.acceleration.y * @time.dt	# v = a * dt
			object.velocity.z += object.acceleration.z * @time.dt	# v = a * dt
			
			object.x(object.x() + object.velocity.x * @time.dt)		# x = x_old + dx
			object.y(object.y() + object.velocity.y * @time.dt)		# y = y_old + dy
			object.z(object.z() + object.velocity.z * @time.dt)		# z = z_old + dz
			
			object.element.style.left = "#{object.position.x*@scale}px"
			object.element.style.top = "#{object.position.y*@scale}px"
			# TODO: scale object for z-axis movement
			
class @UniverseTimer
	constructor: (@universe) ->
		@count	= 0
		@dt		= 0
		@last	= 0
	
	advance: ->
		@timer = setTimeout(( => # Fat arrow binds 'this' to the current Universe object to the function called by setTimeout 
			@universe.run()
		), 1000/@universe.framerate)
		currentTime = new Date().getTime() / 1000 # current time in seconds.
		if @count > 0
			@dt = currentTime - @last
		@last = currentTime
		@count++
	
	stop: ->
		@dt = 0
		@count = 0
		@last = 0
		clearTimeout(@timer)
	
class @UniverseObject
	constructor: (params={}) ->
		@element		= params.element		|| null
		@type			= params.type			|| null
		@mass			= params.mass			|| null
		@width			= params.width			|| null
		@height			= params.height			|| null
		@position		= params.position		|| Universe.create3DVector()
		@velocity		= params.velocity		|| Universe.create3DVector()
		@acceleration	= params.acceleration	|| Universe.create3DVector()
		@universe		= params.universe		|| null
		
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
		
		@element.style.left = "#{@x(@originalPosition.x)*@universe.scale}px"
		@element.style.top = "#{@y(@originalPosition.y)*@universe.scale}px"
		
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