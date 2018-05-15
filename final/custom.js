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

	this.world = new pl.World(Vec2(0, -5));
	this.objects = {};

	this.domElement.appendChild(this.renderer.domElement);
}

Pinball.prototype.addLight = function(type, def) {
	var light = new Light(type, def);
	this.scene.add(light.object);
}

Pinball.prototype.addObject3D = function(dae, type, def) {
	var scene = this.scene,
		loader = new THREE.ColladaLoader();

	loader.load(dae, function(collada) {
		scene.add(collada.scene);
	});

	var object3D = new Object3D(this.world, type, def);
	this.objects.push(object3D);
}

/*Pinball.prototype.start = function() {
	console.log(this.start);
	requestAnimationFrame(this.start);
	this.renderer.render(this.scene, this.camera.object);
}*/

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
	this.type = Object.keys(Camera.TYPES).includes(type) ? type : 'PerspectiveCamera';

	def = setDefaults(def, cameraDef);

	this.object = Camera.TYPES[this.type](def);
	this.object.position.set(...def.position);
}

Light.TYPES = {
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

function Light(type, def) {
	this.type = Object.keys(Light.TYPES).includes(type) ? type : 'AmbientLight';

	def = setDefaults(def, lightDef);

	this.object = Light.TYPES[this.type](def);
	this.object.position.set(...def.position);
	this.object.lookAt(...def.lookAt);
}

Object3D.TYPES = {

}

function Object3D(world, type, def) {
	this.type = Object.keys(Object3D.TYPES).includes(type) ? type : 'StaticObject3D';

	var pl = planck,
		Vec2 = pl.Vec2;

	this.body = new Body(world, def);
	this.physics = BallPhysics(this.body, {});
}

function Physics() {
	
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