class @Universe
  @create3DVector: ->
    x: 0
    y: 0
    z: 0
  @create2DVector: ->
    x: 0
    y: 0
  
  constructor: (params) ->
    @framerate        = params.framerate    ||  100
    @gravity          = params.gravity      || -10              # meters per second per second
    @scale            = params.scale        ||  40              # pixels per meter
    @vacuum           = params.vacuum       ||  false           # TODO: air resistance
    @world            = params.world        ||  null            # Find a default world.
    @objects          = []
    
    # If user supplied an objects array on init we'll
    # configure and push them via the convenience method.
    if params.objects? and params.objects.length > 0
      for universeObject in params.objects
        @addObject(universeObject)
    
    @time = new UniverseTimer(this)
    @run()
    
  run: ->
    @moveObjects()
    @time.advance()
  
  addObject: (universeObject) ->
    universeObject.useScale(@scale).useWorld(@world)
    @objects.push(universeObject)
  
  moveObjects: ->
    for object in @objects
      object.acceleration.y = @gravity
      object.velocity.y     += object.acceleration.y * @time.dt     # v = a * dt
      
      object.x(object.x() + object.velocity.x * @time.dt)           # x = x_old + dx
      object.y(object.y() + object.velocity.y * @time.dt)           # y = y_old + dy
      
      object.element.style.left = "#{object.position.x*@scale}px"
      object.element.style.top  = "#{object.position.y*@scale}px"
      
class @UniverseTimer
  constructor: (@universe) ->
    @count    = 0
    @dt       = 0
    @last     = 0
  
  advance: ->
    setTimeout(( => # Fat arrow binds 'this' to the current Universe object to the function called by setTimeout 
      @universe.run()
    ),1000/@universe.framerate)
    currentTime = new Date().getTime() / 1000 # current time in seconds.
    if @count > 0
      @dt = currentTime - @last
    @last = currentTime
    @count++
  
class @UniverseObject
  constructor: (params) ->
    @element        = params.element          ||  null
    @mass           = params.mass             ||  10
    @width          = params.width            ||  16
    @height         = params.height           ||  16
    @position       = params.position         ||  Universe.create3DVector()
    @velocity       = params.velocity         ||  Universe.create3DVector()
    @acceleration   = params.acceleration     ||  Universe.create3DVector()
    
    # Private Vars
    @_scale         = null
    @_world         = null
    
  belongsToUniverse: ->
    return @_universe?
  
  # Apply universe scale to position.
  useScale: (scale) ->
    if scale != @_scale
      @_scale = scale
      for dimension,value of @position
        @position[dimension] = value / @_scale
    this
  
  useWorld: (world) ->
    @_world = world
    this
  
  x: (x) ->
    if x?
      @position.x = x
    @position.x
  
  y: (y) ->
    if y?
      @position.y = @_world.clientHeight - y
    @_world.clientHeight - @position.y