window.onload = () => {

	var loader = function() {
		var pinball = new Pinball(document.body, level.world.gravity);

		var elements = level.elements;

		Object.keys(elements).forEach(type => {
			Object.keys(elements[type]).forEach(id => {
				pinball.createElement(type, id, elements[type][id]);
			})
		})
	}

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

	pinball.createFlipper('FlipperLeft', {
		dae: 'models/flipperLeft.dae',
		position: [-7.92, -37.07, 1],
		mass: 50,
		points: flipperJSON.find(e => e.name == 'flipperLeft').points,
		lines: flipperJSON.find(e => e.name == 'flipperLeft').lines,
		activeKey: 37,
		active: false,
		orientation: 'right',
		velocity: { down: -30, up: 30 },
		limits: { lower: -0.52, upper: 0.52 }
	});

	pinball.createFlipper('FlipperRight', {
		dae: 'models/flipperRight.dae',
		position: [7.92, -37.07, 1],
		mass: 50,
		points: flipperJSON.find(e => e.name == 'flipperRight').points,
		lines: flipperJSON.find(e => e.name == 'flipperRight').lines,
		activeKey: 39,
		active: false,
		orientation: 'left',
		velocity: { down: 30, up: -30 },
		limits: { lower: -0.52, upper: 0.52 }
	});

	pinball.createBall('Ball1', {
		dae: 'models/ball.dae',
		radius: 1,
		widthSegments: 20,
		heightSegments: 20,
		color: 0xff00ff,
		position: [-7, 0, 0.5],
		mass: 1
	});

	pinball.createStage('Stage1', {
		dae: 'models/supreme.dae',
		position: [0, 0, 0],
		bodys: {
			'body1': {
				points: baseGround.find(e => e.name == 'groundExt').points,
				lines: baseGround.find(e => e.name == 'groundExt').lines
			},
			'body2': {
				points: baseGround.find(e => e.name == 'groundInt').points,
				lines: baseGround.find(e => e.name == 'groundInt').lines
			}
		}
	})

	pinball.createBouncer('Bouncer1', {
		dae: 'models/circle.dae',
		position: [-7.66, 25.86, 0],
		points: circle.points,
		lines: circle.lines,
		bouncing: { min: 8, max: 15 }
	});

	pinball.createBouncer('Bouncer2', {
		dae: 'models/circle.dae',
		position: [0.75, 33.39, 0],
		points: circle.points,
		lines: circle.lines,
		bouncing: { min: 8, max: 15 }
	});

	pinball.createBouncer('Bouncer3', {
		dae: 'models/circle.dae',
		position: [-10, 36.87, 0],
		points: circle.points,
		lines: circle.lines,
		bouncing: { min: 8, max: 15 }
	});

	pinball.start();
}
