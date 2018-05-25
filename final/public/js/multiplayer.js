window.onload = () => {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(85 / 2, -180, 100)
    camera.lookAt(85 / 2, 264 / 2 ,0)

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    Object.entries(elements.lights)
        .forEach(e => {
            var id = e[0],
                def = e[1];

            def = setDefaults(def, lightDef);

            var light = lightTypes[def.type](def);
            light.position.set(...Object.values(def.position));
            light.lookAt(...Object.values(def.lookAt));
            scene.add(light);
        });

    var loader = new THREE.ColladaLoader();
    Object.entries(elements.objects3D)
        .forEach(e => {
            var id = e[0],
                dae = e[1];

            var object = new THREE.Object3D();
            object.name = id;

            loader.load(dae, model => {
                object.add(model.scene);
                scene.add(object);
            });
        });


    var animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

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
        if(evt.keyCode == 37) socket.emit('flipper', { active: true, id: 'p1leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: true, id: 'p1rightFlipper' });
    });

    document.body.addEventListener('keyup', evt => {
        if(evt.keyCode == 37) socket.emit('flipper', { active: false, id: 'p1leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: false, id: 'p1rightFlipper' });
    });
}

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
	position: [0, 0, 0],
	lookAt: [0, 0, 0]
}

function setDefaults(to, from) {
	to = to || {};

	Object.keys(from).forEach(key => to[key] = to[key] || from[key]);

	return to;
}
