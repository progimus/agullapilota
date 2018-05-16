function Pinball(domElement, camera, gravity) {
	this.domElement = domElement || document.body;
	this.scene = new THREE.Scene();

	//this.camera = camera || new Camera();
	this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, -125, 90);
    this.camera.lookAt(0, 0, 0);

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(domElement.offsetWidth, domElement.offsetHeight);

	var pl = planck,
		Vec2 = pl.Vec2;

	this.world = new pl.World(Vec2(0, -10));

	this.balls = {};
	this.flippers = {};

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

Pinball.prototype.createObject3D = function(type, dae) {
	type = Object.keys(Pinball.object3DTypes).includes(type) ? type : 'StaticObject3D';

	//def = setDefaults(def, object3DDef);

	//def.name = this.getObject3D(name) ? 'defaultName' : name;
	//def.position || [0, 0, 0];
	var object3D = Pinball.object3DTypes[type](this.world, dae);
	this.scene.add(object3D.object);
}

Pinball.prototype.getObject3D = function(name) {
	return this.objects3D[name];
}

Pinball.object3DTypes = {
	BallObject3D: function(world, dae) { return new BallObject3D(world, dae); },
	FlipperObject3D: function(world, dae) { return new FlipperObject3D(world, dae); },
	StaticObject3D: function(world, dae) { return new StaticObject3D(world, dae); }
}

function Object3D(world, dae) {
	this.world = world;

	this.object = new THREE.Object3D();

	var that = this;
	var loader = new THREE.ColladaLoader();
	loader.load(dae, collada => {
		that.object.add(collada.scene);
	});

	this.physics = {};
}

Object3D.prototype.update = function() {
	this.object.position.x = this.physics.getPosition().x;
	this.object.position.y = this.physics.getPosition().y;
}

function BallObject3D(world, dae) {
	Object3D.call(this, world, dae);
	this.physics = {

	}
}

function FlipperObject3D(world, dae) {
	Object3D.call(this, world, dae);
	this.flipper = this.object;
	this.object = new THREE.Object3D;
	this.object.add(this.flipper);
}

function StaticObject3D(world, dae) {
	Object3D.call(this, world, dae);
}

BallObject3D.prototype = Object.create(Object3D.prototype);
FlipperObject3D.prototype = Object.create(Object3D.prototype);
StaticObject3D.prototype = Object.create(Object3D.prototype);

Pinball.prototype.createBall = function(id, def) {
	var ball = new Ball(this.world, def);

	this.scene.add(ball.object3D);
	this.balls.id = ball;
}

const ballDef = {
	radius: 1,
	widthSegments: 8,
	heightSegments: 6,
	color: 0xffff00,
	position: [0, 0, 0],
	mass: 1
}

function Ball(world, def) {
	this.type = 'Ball';

	def = setDefaults(def, ballDef);

	this.object3D = new THREE.Mesh(
        new THREE.SphereGeometry(def.radius, def.widthSegments, def.heightSegments),
        new THREE.MeshPhongMaterial({ color: def.color })
    );
    this.object3D.position.set(...def.position);

    var pl = planck,
    	Vec2 = pl.Vec2;

	this.body = world.createDynamicBody({
		position: Vec2(def.position[0], def.position[2]),
		bullet: true
	});

	this.fixture = this.body.createFixture(pl.Circle(def.radius), def.mass);
}

Pinball.prototype.createFlipper = function(id, dae, def) {
	var flipper = new Flipper(this.world, dae, def);

	this.scene.add(flipper.object3D);
	this.flippers.id = flipper;
}

Ball.prototype.update = function() {
	var position = this.body.getPosition();
	this.object3D.position.x = position.x;
	this.object3D.position.y = position.y;
}

function Flipper(world, dae, def) {
	this.type = 'Flipper';

	this.object3D = new THREE.Object3D();

	var loader = new THREE.ColladaLoader(),
		that = this;

	loader.load(dae, collada => {
		that.object3D.add(collada.scene);
	});
	this.object3D.position.set(...def.position);

	this.world = world;

	this.fixture = this.body.createFixture()
}

/////////////////////////////////
function setDefaults(to, from) {
	to = to || {};

	/*Object.keys(from)
		.forEach(key => to[key] = to[key] || from[key]);*/

	for(var key in from) {
		to[key] = to[key] || from[key];
	}

	return to;
}