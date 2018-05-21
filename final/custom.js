const pl = planck,
	Vec2 = pl.Vec2;

function Pinball(domElement, def) {
	this.domElement = domElement || document.body;
	this.scene = new THREE.Scene();

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(domElement.offsetWidth, domElement.offsetHeight);

	this.world = new pl.World(Vec2(...def.world.gravity));

	this.elements = {
		cameras: {},
		lights: {},
		balls: {},
		flippers: {},
		stages: {},
		bouncers: {}
	}

	this.camera = def.camera;

	var elements = def.elements;

	Object.keys(elements).forEach(type => {
		Object.keys(elements[type]).forEach(id => {
			this.createElement(type, id, elements[type][id]);
		});
	});

	this.domElement.appendChild(this.renderer.domElement);

	console.log(this.world.getBodyList());
}

Pinball.prototype.start = function() {
	this.world.step(1/ 25)
	this.update();
	this.renderer.render(this.scene, this.elements.cameras[this.camera].object);
	requestAnimationFrame(() => this.start());
}

Pinball.prototype.update = function() {
	var camera = this.elements.cameras[this.camera];
		ball = camera.follow.ball;

	//if(ball) camera.update(this.elements.balls[ball].object.position);
	Object.keys(this.elements.balls).forEach(key => {
		var ball = this.elements.balls[key];

		if(ball.inShuttle) ball.object.position.z = this.elements.shuttles[ball.inShuttle].getZ();
		ball.update();
	});
	Object.keys(this.elements.flippers).forEach(key => this.elements.flippers[key].update());
}

Pinball.cameraTypes = {
	PerspectiveCamera: function(def) { return new THREE.PerspectiveCamera(def.fov, def.aspect, def.near, def.far); }
}

Pinball.lightTypes = {
	AmbientLight: function(def) { return new THREE.AmbientLight(def.color, def.intensity); },
	DirectionalLight: function(def) { return new THREE.DirectionalLight(def.color, def.intensity); },
	HemisphereLight: function(def) { return new THREE.HemisphereLight(def.skyColor, def.groundColor, def.intensity); },
	PointLight: function(def) { return new THREE.HemisphereLight(def.color, def.intensity, def.distance, def.decay); },
	RectAreaLight: function(def) { return new THREE.RectAreaLight(def.color, def.intensity, def.width, def.height); },
	SpotLight: function(def) { return new THREE.SpotLight( def.color, def.intensity, def.distance, def.angle, def.penumbra, def.decay); }
}

Pinball.object3DTypes = {
	Ball: function(world, def) { return new Ball(world, def); },
	Flipper: function(world, def) { return new Flipper(world, def); },
	Stage: function(world, def) { return new Stage(world, def); },
	Bouncer: function(world, def) { return new Bouncer(world, def); }
};

Pinball.prototype.createElement = function(type, id, def) {
	var elementTypes = {
		cameras: (id, def) => {
			var camera = new Camera(def);
			this.elements.cameras[id] = camera;
		},
		lights: (id, def) => {
			type = Object.keys(Pinball.lightTypes).includes(def.type) ? def.type : 'AmbientLight';

			def = setDefaults(def, lightDef);

			var light = Pinball.lightTypes[type](def);
			light.position.set(...def.position);
			light.lookAt(...def.lookAt);

			this.scene.add(light);
			this.elements.lights[id] = light;
		},
		objects3D: (id, def) => {
			type = Object.keys(Pinball.object3DTypes).includes(def.type) ? def.type : 'Stage';

			var object3D = Pinball.object3DTypes[type](this.world, def);
			this.scene.add(object3D.object);
			this.elements[type.toLowerCase() + 's'][id] = object3D;
		}
	}
	elementTypes[type](id, def);
}

const cameraDef = {
	fov: 45,
	aspect: window.innerWidth / window.innerHeight,
	near: 1,
	far: 1000,
	position: [0, 0, 0],
	lookAt: [0, 0, 0],
};

const lightDef = {
	color: 0xffffff,
	intensity: 1,
	skyColor: 0xffffff,
	groundColor: 0xffffff,
	distance: 0,
	decay: 1,
	width: 10,
	height: 10,
	position: [0, 0, 0],
	lookAt: [0, 0, 0],
}

const ballDef = {
	radius: 1,
	widthSegments: 8,
	heightSegments: 6,
	color: 0xffff00,
	position: [0, 0, 0],
	mass: 1
}

function Camera(def) {
	type = Object.keys(Pinball.cameraTypes).includes(def.type) ? def.type : 'PerspectiveCamera';

	def = setDefaults(def, cameraDef);

	this.object = Pinball.cameraTypes[type](def);
	this.object.position.set(...def.position);
	this.object.lookAt(...def.lookAt);

	this.follow = def.follow;
}

Camera.prototype.update = function(ballPosition) {
	var cameraPosition = this.object.position;

	this.object.position.y = ballPosition.y + cameraPosition.y;
	this.object.lookAt(0, ballPosition.y, 0);
}


function Object3D(world, def) {
    this.world = world;

	this.object = new THREE.Object3D();

	var loader = new THREE.ColladaLoader(),
		that = this;

	loader.load(def.dae, collada => {
		that.object.add(collada.scene);
	});
	this.object.position.set(...def.position);
}

Object3D.prototype.createFixture = function(body, def) {
	var points = def.points,
		lines = def.lines;

	for(var i = 0; i < lines.length; i += 2) {
        var index1 = lines[i] * 3,
        	index2 = lines[i + 1] * 3;

        var x1 = points[index1],
        	y1 = points[index1 + 2],
        	x2 = points[index2],
        	y2 = points[index2 + 2];

        body.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
    }
}

function Ball(world, def) {
    Object3D.call(this, world, def);

    this.type = 'Ball';

	this.body = world.createDynamicBody({
		position: Vec2(def.position[0], def.position[1]),
		bullet: true
	});

	this.body.createFixture(pl.Circle(def.radius), def.mass);

	this.inShuttle = def.shuttle;

}

Ball.prototype = Object.create(Object3D.prototype);

Ball.prototype.update = function() {
	var position = this.body.getPosition();
	this.object.position.x = position.x;
	this.object.position.y = position.y;
}

function Flipper(world, def) {
    Object3D.call(this, world, def);

    this.type = 'Flipper';

	this.body = world.createDynamicBody({
		position: Vec2(def.position[0], def.position[1]),
		bullet: true
	});

	this.body.createFixture(pl.Circle(1), def.mass);
	this.createFixture(this.body, def);

	this.orientation = def.orientation;
	this.velocity = { down: def.velocity.down, up: def.velocity.up };
	this.limits = { lower: def.limits.lower, upper: def.limits.upper };

	let optionJoint = {
		enableMotor: true,
		lowerAngle: this.limits.lower,
		upperAngle: this.limits.upper,
		enableLimit: true,
		collideConnected: false,
		maxMotorTorque: 150000
	};

	this.motor = world.createJoint(pl.RevoluteJoint(optionJoint, world.createBody(), this.body, Vec2(def.position[0], def.position[1])));

	document.body.addEventListener('keydown', evt => {
		if(evt.keyCode == def.activeKey) this.active = true;
	});

	document.body.addEventListener('keyup', evt => {
		if(evt.keyCode == def.activeKey) this.active = false;
	});
}

Flipper.prototype = Object.create(Object3D.prototype);

Flipper.prototype.update = function() {
	this.body.setFixedRotation(false);

	if(this.orientation == 'right') {
		if(this.active) {
			if(this.motor.getJointAngle() >= this.limits.upper) {
				this.body.setAngle(this.limits.upper);
				this.body.setFixedRotation(true);
			}
		} else {
			if(this.motor.getJointAngle() <= this.limits.lower) {
				this.body.setAngle(this.limits.lower);
				this.body.setFixedRotation(true);
			}
		}
	} else {
		if(this.active) {
			if(this.motor.getJointAngle() <= this.limits.lower) {
				this.body.setAngle(this.limits.lower);
				this.body.setFixedRotation(true);
			}
		} else {
			if(this.motor.getJointAngle() >= this.limits.upper) {
				this.body.setAngle(this.limits.upper);
				this.body.setFixedRotation(true);
			}
		}
	}

	this.motor.setMotorSpeed(this.active ? this.velocity.up : this.velocity.down);
	this.object.rotation.z = this.motor.getJointAngle();

	var position = this.body.getPosition();
	this.object.position.x = position.x;
	this.object.position.y = position.y;
}

function Stage(world, def) {
    Object3D.call(this, world, def);

    this.type = 'Stage';

	this.bodys = {};

	Object.keys(def.bodys).forEach(bodyId => {
        this.bodys[bodyId] = world.createBody();
        this.createFixture(this.bodys[bodyId], def.bodys[bodyId]);
    });
}

Stage.prototype = Object.create(Object3D.prototype);

function Bouncer(world, def) {
	Object3D.call(this, world, def);

	this.type = 'Bouncer';

	this.body = world.createBody({
		position: Vec2(def.position[0], def.position[1])
	});

	console.log(this.body);

	this.createFixture(this.body, def);

	this.bouncing = def.bouncing;

	world.on('end-contact', contact => {
		if(this.body == contact.getFixtureA().getBody()) {
			console.log('collide');
			var ball = contact.getFixtureB().getBody(),
				velocity = ball.getLinearVelocity(),
				impulse = velocity.mul(1.5);

			if(Math.abs(impulse.x) < this.bouncing.min && Math.abs(impulse.y) < this.bouncing.min) {
				var bigger = Math.abs(velocity.x) > Math.abs(velocity.y) ? velocity.x : velocity.y;
				var multipler = Math.abs(this.bouncing.min / bigger);
				impulse = velocity.mul(multipler);
			} else if(Math.abs(impulse.x) > this.bouncing.max || Math.abs(impulse.y) > this.bouncing.max) {
				var bigger = Math.abs(velocity.x) > Math.abs(velocity.y) ? velocity.x : velocity.y;
				var divisor = Math.abs(bigger / this.bouncing.max);
				impulse = Vec2(velocity.x / divisor, velocity.y / divisor);
			}
			ball.applyLinearImpulse(impulse, Vec2(0, 0), true);
		}
	});
}

Bouncer.prototype = Object.create(Object3D.prototype);

function Shuttle(world, def) {
	Object3D.call(this, world, def);

	this.type = 'Shuttle';

	this.body = world.createBody({
		position: Vec2(def.position[0], def.position[1])
	});
	this.createFixture(this.body, def);

	this.sensor = world.createBody({
		position: Vec2(def.position[0], def.position[1])
	});
	this.createFixture(this.sensor, def.sensor);
	this.sensor.getFixtureList().setSensor(true);

	world.on('end-contact', contact => {

	});

	this.activeKey = 32;
	this.balls = def.balls;

	document.body.addEventListener('keyup', evt => {
		//if(evt.keyCode == this.activeKey)
	});

	this.z = def.position[2];
}

Shuttle.prototype = Object.create(Object3D.prototype);

Shuttle.prototype.getZ = function() {
	this.z;
}

/////////////////////////////////
function setDefaults(to, from) {
	to = to || {};

	Object.keys(from).forEach(key => to[key] = to[key] || from[key]);

	return to;
}
