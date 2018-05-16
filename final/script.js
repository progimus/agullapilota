window.onload = () => {
	var camera = new Camera('PerspectiveCamera', {
		fov: 30,
		aspect: document.body.offsetWidth / document.body.offsetHeight,
		near: 1,
		far: 1000,
		position: [0, -125, 90]
	});

	var pinball = new Pinball(document.body, camera, [0, -5]);

	pinball.createLight('DirectionalLight', {
		color: 0xffffff,
		intensity: 1,
		position: [0, -125, 75]
	});

	pinball.createLight('AmbientLight', {
		color: 0xffffff,
		intensity: 0.3
	});

	pinball.createObject3D('StaticObject3D', 'models/supreme.dae');

	pinball.createFlipper('Flipper1', 'models/flipper.dae', {
		position: [-7.92, -37.07, 1]
	});

	pinball.createBall('ball1', {
		radius: 1,
		widthSegments: 20,
		heightSegments: 20,
		color: 0xff00ff,
		position: [10, 0.5, 4],
		mass: 1
	});

	console.log(pinball.world)
	pinball.start();

	/*var animate = function() {
		requestAnimationFrame(animate);
		pinball.renderer.render(pinball.scene, pinball.camera);
	}

	animate();*/
}