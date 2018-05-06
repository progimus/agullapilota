// Global Variables
var balls = [];
// THREE Variables
//var scene;
// Planck Variables
//var world, pl, Vec2;

// @createFlipper(leftFlipper: boolean, position: Vector3, boardToConnect: Mesh, escena: THREE.Scene, world: PhysicsWorld)
function createFlipper(leftFlipper, position, ground, scene, world, pl, Vec2) {
    let motor = new THREE.Object3D();
    motor.position.set(position.x, position.y, position.z);
    scene.add(motor);

    let flipper = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2, 2),
        new THREE.MeshNormalMaterial()
    );

    let flipperWidth = flipper.geometry.parameters.width;
    let anchorPosition = leftFlipper ? flipperWidth/2 : -(flipperWidth/2);
    flipper.position.x = anchorPosition;
    motor.add(flipper);

    let flipperBodyX = leftFlipper ? position.x + (flipperWidth/2) : position.x - (flipperWidth/2);
    let flipperBody = world.createDynamicBody({ position: Vec2(flipperBodyX, position.y), bullet: true });
    flipperBody.createFixture(pl.Box(flipperWidth/2, 1), 20);

    let optionJoint = {
        enableMotor: true,
        lowerAngle: -0.5235,
        upperAngle: 0.5235,
        enableLimit: true,
        collideConnected: false,
        maxMotorTorque: 1000000
    };

    let joint = world.createJoint(pl.RevoluteJoint(optionJoint, ground, flipperBody, Vec2(position.x, position.y)));

    let object = {
        type: leftFlipper ? "leftFlipper" : "rightFlipper",
        f_Mesh: flipper,
        f_Motor: motor,
        f_Body: flipperBody,
        f_Joint: joint
    };

    return object;
}

function createFlipperOponent(leftFlipper, position, scene) {
    let motor = new THREE.Object3D();
    motor.position.set(position.x, position.y, position.z);
    scene.add(motor);

    let flipper = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2, 2),
        new THREE.MeshNormalMaterial()
    );

    let flipperWidth = flipper.geometry.parameters.width;
    let anchorPosition = leftFlipper ? flipperWidth/2 : -(flipperWidth/2);
    flipper.position.x = anchorPosition;
    motor.add(flipper);

    let object = {
        type: leftFlipper ? "leftFlipper" : "rightFlipper",
        f_Mesh: flipper,
        f_Motor: motor
    };

    return object;
}

function updateFlippers(flippers) {
    var rotationAngles = [];
    for(flipper of flippers) {
        let keyPress = flipper.type == 'leftFlipper' ? flippers.left : flippers.right;
        let [velUp, velDown] = flipper.type == 'leftFlipper' ? [20,-20] : [-20, 20];
        flipper.f_Joint.setMotorSpeed(keyPress ? velUp : velDown);
        flipper.f_Motor.rotation.z = flipper.f_Joint.getJointAngle();
        rotationAngles.push(flipper.f_Joint.getJointAngle());
    }
    return rotationAngles;
}
