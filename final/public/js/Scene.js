const lightTypes = {
	AmbientLight: function(def) { return new THREE.AmbientLight(def.color, def.intensity); },
	DirectionalLight: function(def) { return new THREE.DirectionalLight(def.color, def.intensity); },
	HemisphereLight: function(def) { return new THREE.HemisphereLight(def.skyColor, def.groundColor, def.intensity); },
	PointLight: function(def) { return new THREE.HemisphereLight(def.color, def.intensity, def.distance, def.decay); },
	RectAreaLight: function(def) { return new THREE.RectAreaLight(def.color, def.intensity, def.width, def.height); },
	SpotLight: function(def) { return new THREE.SpotLight( def.color, def.intensity, def.distance, def.angle, def.penumbra, def.decay); }
}

const lightDef = {
    type: 'AmbientLight',
	color: 0xffffff,
	intensity: 1,
	skyColor: 0xffffff,
	groundColor: 0xffffff,
	distance: 0,
	decay: 1,
	width: 10,
	height: 10,
	position: { x: 0, y: 0, z: 0 },
	lookAt: { x: 0, y: 0, z: 0 }
}

const cameraTypes = {
	PerspectiveCamera: function(def) { return new THREE.PerspectiveCamera(def.fov, def.aspect, def.near, def.far); }
}

const cameraDef = {
    type: 'PerspectiveCamera',
	fov: 45,
	aspect: window.innerWidth / window.innerHeight,
	near: 1,
	far: 1000,
	position: [0, 0, 0],
	lookAt: [0, 0, 0],
};

function loadLevel() {
    var socket = io();

    socket.on('update', data => {
        Object.entries(data)
            .forEach(e => {
                var id = e[0],
                    def = e[1];

                var obj = scene.children.find(e => e.name == id);

                if(def.p) obj.position.set(...Object.values(def.p));
                if(def.a) obj.rotation.z = def.a;
            });
    });

    document.body.addEventListener('keydown', evt => {
        if(evt.keyCode == 37) socket.emit('flipper', { active: true, id: 'leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: true, id: 'rightFlipper' });
    });

    document.body.addEventListener('keyup', evt => {
        if(evt.keyCode == 37) socket.emit('flipper', { active: false, id: 'leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: false, id: 'rightFlipper' });
    });
}

function setDefaults(to, from) {
	to = to || {};

	Object.keys(from).forEach(key => to[key] = to[key] || from[key]);

	return to;
}

function Scene(domElement, def) {
    this.scene = new THREE.Scene();

	this.player = null;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.cameras = {};
    this.lights = {};
    this.objects3D = {};

    Object.entries(def.cameras).forEach(camera => this.createCamera(...camera));
    Object.entries(def.lights).forEach(light => this.createLight(...light));
    Object.entries(def.objects3D).forEach(object3D => this.createObject3D(...object3D));

    document.body.addEventListener('keydown', evt => {
        if(evt.keyCode == 37) socket.emit('flipper', { active: true, id: 'leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: true, id: 'rightFlipper' });
    });

    document.body.addEventListener('keyup', evt => {
        if(evt.keyCode == 37) socket.emit('flipper', { active: false, id: 'leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: false, id: 'rightFlipper' });
    });

	/*window.addEventListener('resize', () => {
        Object.values(this.cameras).forEach(camera => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        this.renderer.setSize(window.innerWidth / window.innerHeight);
    });*/
}

Scene.prototype.start = function() {
    //this.update();
	var player = this.player,
		camera = Object.values(this.cameras)
			.find(camera => camera);
	//console.log(this.player)

	this.renderer.render(this.scene, camera);
	requestAnimationFrame(() => this.start());
}

Scene.prototype.update = function() {

}

Scene.prototype.setPlayer = function(player) {
	this.player = player;
}

Scene.prototype.createCamera = function(id, def) {
    var def = this.setDefaults(def, cameraDef);

    var camera = cameraTypes[def.type](def);
    camera.position.set(...Object.values(def.position));
    camera.lookAt(...Object.values(def.lookAt));
	camera.userData.owner = def.owner;
    this.cameras[id] = camera;
}

Scene.prototype.createLight = function(id, def) {
    var def = this.setDefaults(def, lightDef);

    var light = lightTypes[def.type](def);
    light.position.set(...Object.values(def.position));
    light.lookAt(...Object.values(def.lookAt));
    this.scene.add(light);
    this.lights[id] = light;
}

Scene.prototype.createObject3D = function(id, dae) {
    var loader = new THREE.ColladaLoader();

    var object3D = new THREE.Object3D();
    object3D.name = id;

    loader.load(dae, model => {
        object3D.add(model.scene);
        this.scene.add(object3D);
    });
}

Scene.prototype.setDefaults = function(to, from) {
    var to = to || {};

    Object.keys(from).forEach(key => to[key] = to[key] || from[key]);

    return to;
}
