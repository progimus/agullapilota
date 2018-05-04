var socket;

var init = function(n) {
    var div = document.getElementById('camera' + n);
    //THREE
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    var camera = new THREE.PerspectiveCamera(40, div.offsetWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -100, 125);
    camera.lookAt(0, 0, 0);

    //var controls = new THREE.OrbitControls(camera);
    
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(div.offsetWidth, window.innerHeight);

    div.appendChild(renderer.domElement);

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
    if(n == 1) {
        //Physics
        pl = planck;
        Vec2 = pl.Vec2;
        world = new pl.World(Vec2(0, -30));

        var ballBody = world.createDynamicBody({ position: Vec2(-7, 0), bullet: true });
        ballBody.createFixture(pl.Circle(1), 1);

        var ground = world.createBody();

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
                ground.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
            }               
        }        
        ballBody.getFixtureList().setRestitution(0.3);
    } else {
        flippers.push(createFlipperOponent(true, new THREE.Vector3(-8.28, -42.78, 1.5), scene));
        flippers.push(createFlipperOponent(false, new THREE.Vector3(8.28, -42.78, 1.5), scene));
    }
    
    
    var animate = function () {
        requestAnimationFrame(animate);
        if(n == 1) updatePhysics();
        //controls.update();
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
    

    var updatePhysics = () => {
        var flippersAngle = updateFlippers(flippers, n);
        world.step(1 / 60);
        var ballPosition = ballBody.getPosition();
        ball.position.x = ballPosition.x;
        ball.position.y = ballPosition.y;
        socket.emit('positions', {
            ball: { x: ballPosition.x, y: ballPosition.y },
            flippers: { l: flippersAngle[0] , r: flippersAngle[1] }
        });
    }

    if(n == 2) {
        socket.on('updatePositions', positions => {
            if(positions != null) {
                ball.position.x = positions.ball.x;
                ball.position.y = positions.ball.y;
            }
        });
    }
    
    animate();
}

window.onload = function() {
    socket = io();
    init(1);
    init(2);
}