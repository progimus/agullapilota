var socket;

var init = function() {
    //THREE
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -125, 125);
    camera.lookAt(0, 0, 0);

    var controls = new THREE.OrbitControls(camera);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild( renderer.domElement );

    var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
    light.position.set(0, 50, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    var loader = new THREE.ColladaLoader();
    loader.load("models/model.dae", function(collada) {
        scene.add(collada.scene);
    });

    var ball = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 20),
        new THREE.MeshPhongMaterial({ color: 0xfcaf0a })
    );
    ball.position.set(-7, 0, 1)
    scene.add(ball);

    var flippers = [];
    //Physics
    pl = planck;
    Vec2 = pl.Vec2;
    world = new pl.World(Vec2(0, -30));

    var ballBody = world.createDynamicBody({ position: Vec2(-7, 0), bullet: true });
    ballBody.createFixture(pl.Circle(1), 1);

    var ground = world.createBody();
    var leftTopRamp = world.createBody();
    var rightTopRamp = world.createBody();
    var topesDelBien = world.createBody();
    var ramp = world.createBody();
    var heightmap = [];

    flippers.push(createFlipper(true, new THREE.Vector3(-8.28, -42.78, 1.5), ground, scene, world, pl, Vec2));
    flippers.push(createFlipper(false, new THREE.Vector3(8.28, -42.78, 1.5), ground, scene, world, pl, Vec2));

    for(var obj of baseGround) {
        for(var i = 0; i < obj.lines.length; i += 2) {
            let index1 = obj.lines[i] * 3;
            let index2 = obj.lines[i + 1] * 3;
            var x1 = obj.points[index1];
            var y1 = obj.points[index1 + 2];
            var x2 = obj.points[index2];
            var y2 = obj.points[index2 + 2];
            if(obj.name == 'left') {
                leftTopRamp.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
            } else if(obj.name == 'right') {
                rightTopRamp.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
            } else if(obj.name == 'rampa') {
                ramp.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
            } else if(obj.name == 'topeR' || obj.name == 'topeL') {
                topesDelBien.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
            } else {
                ground.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
            }
        }
        if(obj.name == 'rampa') {
            for(var i = 0; i < obj.lines.length; i += 2) {
                let index1 = obj.lines[i] * 3;
                let index2 = obj.lines[i + 1] * 3;
                var point = {
                    x1: obj.points[index1],
                    z1: obj.points[index1 + 1],
                    y1: obj.points[index1 + 2],
                    x2: obj.points[index2],
                    z2: obj.points[index2 + 1],
                    y2: obj.points[index2 + 2]
                };
                heightmap.push(point);
            }
        }
    }
    heightmap.sort((a, b) => a.y1 - b.y1);
    ballBody.getFixtureList().setRestitution(0.3);

    leftTopRamp.m_fixtureList.m_isSensor = true;
    rightTopRamp.m_fixtureList.m_isSensor = true;

    ramp.setActive(false);
    topesDelBien.setActive(true);

    world.on('end-contact', (contact, oldManifold) => {
        if(contact.getFixtureA() == leftTopRamp.m_fixtureList || contact.getFixtureA() == rightTopRamp.m_fixtureList) {
            ramp.setActive(!ramp.isActive());
            topesDelBien.setActive(!topesDelBien.isActive());
        }
    });



    var animate = function () {
        requestAnimationFrame(animate);
        updatePhysics();
        controls.update();
        renderer.render(scene, camera);
    };

    [flippers.left, flippers.right] = [false, false];

    document.body.addEventListener("keydown", evt => {
        if(evt.keyCode == 37 || evt.keyCode == 65) flippers.left = true;
        if(evt.keyCode == 39 || evt.keyCode == 80) flippers.right = true;
    });

    document.body.addEventListener("keyup", evt => {
        if(evt.keyCode == 37 || evt.keyCode == 65) flippers.left = false;
        if(evt.keyCode == 39 || evt.keyCode == 80) flippers.right = false;
    });

    document.body.addEventListener("keyup", evt => {
        if(evt.keyCode == 32) {
            ballBody.setPosition(Vec2(-7, 0));
        }

    });

    var updatePhysics = () => {
        var flippersAngle = updateFlippers(flippers);
        world.step(1 / 60);
        var ballPosition = ballBody.getPosition();
        ball.position.x = ballPosition.x;
        ball.position.y = ballPosition.y;

        let salir = false;
        if(ramp.isActive()) {
            for(position of heightmap) {
                if(salir == false) {
                    if(position.y1 < ball.position.y && position.y2 > ball.position.y) {
                        salir = true;
                        let distance = Math.abs(position.y2 - position.y1);
                        let distance2 = Math.abs(position.y1 - (ballPosition.y + 0.5));
                        let porcentaje = distance2 / distance;
                        let lol =  Math.abs(position.z1 - position.z2);
                        let z = position.z1 - (lol * porcentaje);
                        //console.log(ballPosition.y + ", " + position.y1 + ", " + position.y2 + "," + porcentaje + "," + z + "," + lol);
                        ball.position.z = -z + 1;
                    }
                }
            }
        }
    }
    animate();
}

window.onload = function() {
    socket = io();
    init();
}
