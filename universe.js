var Universe = {
	framerate: 100,
	gravity: -10, // meters per second per second
	objects: [], // log all active objects
	scale: 40, // pixels per meter
	time: {
		count: 0,
		dt: 0,
		last: 0,
		advance: function() {
			setTimeout(function() {
				Universe.run();
			}, 1000/this.framerate);
			
			var t = (new Date()).getTime() / 1000; // current time in seconds
			if (this.count > 0) { this.dt = t - this.last; }
			this.last = t;
			this.count++;
		}
	},
	vacuum: false, // TODO: air resistance
	world: null, // find a default world
	
	init: function(options) {
		for (option in options) {
			this[option] = options[option];
		}
		
		this.run();
		
		return this.world;
	},
	
	run: function() {
		this.move_objects();
		this.time.advance();
	},
	
	move_objects: function() {
		for (var i = 0; i < this.objects.length; i++) {
			var dt = this.time.dt;
			
			this.objects[i].acceleration.y = this.gravity; // constant acceleration due to gravity
			this.objects[i].velocity.y += this.objects[i].acceleration.y * dt; // v = a * dt
			
			this.objects[i].y(this.objects[i].y() + this.objects[i].velocity.y * dt); // y = y_old + dy
			this.objects[i].x(this.objects[i].x() + this.objects[i].velocity.x * dt); // x = x_old + dx
			
			this.objects[i].element.style.top = (this.objects[i].position.y * this.scale) + "px";
			this.objects[i].element.style.left = (this.objects[i].position.x * this.scale) + "px";
		}
	}
};

function UniverseObject(properties) {
	this.element = null;
	this.world = null;
	this.mass = 10;
	this.width = 16;
	this.height = 16;
	this.position = {x: 0, y: 0, z: 0};
	this.velocity = {x: 0, y: 0, z: 0};
	this.acceleration = {x: 0, y: 0, z: 0};
	
	// allow for custom options
	for (property in properties) {
		this[property] = properties[property];
	}
	
	// apply scale to initial position
	for (direction in this.position) {
		this.position[direction] = this.position[direction] / Universe.scale;
	}
	
	// either set new positions or return current positions
	this.x = function (_x) {
		if (_x != null) { this.position.x = _x; }
		return this.position.x;
	}
	
	this.y = function (_y) {
		if (_y != null) { this.position.y = this.world.clientHeight - _y; }
		return this.world.clientHeight - this.position.y;
	}
	
	Universe.objects.push(this);
};