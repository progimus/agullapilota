const pl = planck,
	Vec2 = pl.Vec2;

function Pinball(domElement, camera, gravity) {
	this.domElement = domElement || document.body;
	this.scene = new THREE.Scene();

	//this.camera = camera || new Camera();
	this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, -125, 90);
    this.camera.lookAt(0, 0, 0);

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(domElement.offsetWidth, domElement.offsetHeight);

	this.world = new pl.World(Vec2(0, -10));

	this.balls = {};
	this.flippers = {};
	this.stages = {};

	this.domElement.appendChild(this.renderer.domElement);
}

Pinball.prototype.start = function() {
	this.world.step(1/ 25)
	this.update();
	this.renderer.render(this.scene, this.camera);
	requestAnimationFrame(() => this.start());
}

Pinball.prototype.update = function() {
	Object.keys(this.balls).forEach(key => this.balls[key].update());
	Object.keys(this.flippers).forEach(key => this.flippers[key].update());
}

Pinball.prototype.createBall = function(id, def) {
	var ball = new Ball(this.world, def);
	this.scene.add(ball.object);
	this.balls[id] = ball;
}

Pinball.prototype.createFlipper = function(id, def) {
	var flipper = new Flipper(this.world, def);
	this.scene.add(flipper.object);
	this.flippers[id] = flipper;
}

Pinball.prototype.createStage = function(id, def) {
	var stage = new Stage(this.world, def);
	this.scene.add(stage.object);
	this.stages[id] = stage;
}

Camera.TYPES = {
	PerspectiveCamera: function(def) {
		return new THREE.PerspectiveCamera(def.fov, def.aspect, def.near, def.far);
	}
}

const cameraDef = {
	fov: 45,
	aspect: 1.19,
	near: 1,
	far: 1000,
	position: [0, 0, 0]
};

function Camera(type, def) {
	type = Object.keys(Camera.TYPES).includes(type) ? type : 'PerspectiveCamera';

	def = setDefaults(def, cameraDef);

	this.object = Camera.TYPES[type](def);
	this.object.position.set(...def.position);
}

Pinball.lightTypes = {
	AmbientLight: function(def) { return new THREE.AmbientLight(def.color, def.intensity); },
	DirectionalLight: function(def) { return new THREE.DirectionalLight(def.color, def.intensity); },
	HemisphereLight: function(def) { return new THREE.HemisphereLight(def.skyColor, def.groundColor, def.intensity); },
	PointLight: function(def) { return new THREE.HemisphereLight(def.color, def.intensity, def.distance, def.decay); },
	RectAreaLight: function(def) { return new THREE.RectAreaLight(def.color, def.intensity, def.width, def.height); },
	SpotLight: function(def) { return new THREE.SpotLight( def.color, def.intensity, def.distance, def.angle, def.penumbra, def.decay); }
}

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

Pinball.prototype.createLight = function(type, def) {
	type = Object.keys(Pinball.lightTypes).includes(type) ? type : 'AmbientLight';

	def = setDefaults(def, lightDef);

	var light = Pinball.lightTypes[type](def);
	light.position.set(...def.position);
	light.lookAt(...def.lookAt);

	this.scene.add(light);
}

const ballDef = {
	radius: 1,
	widthSegments: 8,
	heightSegments: 6,
	color: 0xffff00,
	position: [0, 0, 0],
	mass: 1
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

	this.velocity = { up: def.velocity.up, down: -def.velocity.down };
	this.angles = { min: -def.angles.min, max: def.angles.max }

	let optionJoint = {
        enableMotor: true,
        lowerAngle: this.angles.min,
        upperAngle: this.angles.max,
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

	console.log(this.body);
}

Flipper.prototype = Object.create(Object3D.prototype);

Flipper.prototype.update = function() {
    this.body.setFixedRotation(false);

    if(this.active) {
        if(this.motor.getJointAngle() >= this.angles.max) {
            this.body.setAngle(this.angles.max);
            this.body.setFixedRotation(true);
        }
    } else {
        if(this.motor.getJointAngle() <= this.angles.min) {
            this.body.setAngle(this.angles.min);
            this.body.setFixedRotation(true);
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

/////////////////////////////////
function setDefaults(to, from) {
	to = to || {};

	Object.keys(from).forEach(key => to[key] = to[key] || from[key]);

	return to;
}
