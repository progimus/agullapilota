window.onload = () => {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(85 / 2, -160, 100)
    camera.lookAt(85 / 2, 264 / 2 ,0)

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight());
    var light = new THREE.DirectionalLight();
    light.position.set(85 / 2, -160, 100);
    light.lookAt(85 / 2, 264 / 2 ,0)
    scene.add(light);

    var loader = new THREE.ColladaLoader();
    loader.load('models/multiplayer.dae', collada => {
        scene.add(collada.scene);
    });

    var p1FlipperLeft = new THREE.Object3D();
    var p1FlipperRight = new THREE.Object3D();


    loader.load('models/mFlipperLeft.dae', collada => {
        p1FlipperLeft.add(collada.scene);
        p1FlipperLeft.position.set(30.9, 8.29, 3)
        scene.add(p1FlipperLeft)
    })

    loader.load('models/mFlipperRight.dae', collada => {
        p1FlipperRight.add(collada.scene);
        p1FlipperRight.position.set(54.10, 8.29, 3)
        scene.add(p1FlipperRight)
    })

    var ball = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    scene.add(ball);

    var animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    var socket = io();

    socket.on('update', (data) => {
        //console.log(data.p1leftFlipper.p)
        ball.position.set(...Object.values(data.ball1.p))
        p1FlipperLeft.position.set(...Object.values(data.p1leftFlipper.p))
        p1FlipperRight.position.set(...Object.values(data.p1rightFlipper.p))
        p1FlipperLeft.rotation.z = data.p1leftFlipper.a;
        p1FlipperRight.rotation.z = data.p1rightFlipper.a;
    });

    document.body.addEventListener('keydown', evt => {
        console.log(evt.keyCode)
        if(evt.keyCode == 37) socket.emit('flipper', { active: true, id: 'p1leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: true, id: 'p1rightFlipper' });
    });

    document.body.addEventListener('keyup', evt => {
        if(evt.keyCode == 37) socket.emit('flipper', { active: false, id: 'p1leftFlipper' });
        if(evt.keyCode == 39) socket.emit('flipper', { active: false, id: 'p1rightFlipper' });
    });
}
