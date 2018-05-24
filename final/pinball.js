const pl = require('./public/libs/planck'),
    Vec2 = pl.Vec2;

module.exports = Pinball;

function Pinball(def) {
    this.world = new pl.World(Vec2(def.world.gravity.x, def.world.gravity.y));

    this.physics = {
        ball: {},
        flipper: {},
        stage: {}
    }

    Object.keys(def.physics).forEach(id => {
        var type = def.physics[id].type;
        this.physics[type][id] = Physic.types[type](this.world, def.physics[id]);
    });
}

Pinball.prototype.update = function() {
    var res = {}
    var balls = this.physics.ball,
        flippers = this.physics.flipper;

	Object.keys(balls).forEach(id => {
        var ball = balls[id];
		/*var ball = this.physics.ball[key],
			ballZ = ball.getZ(),
			inside = ball.getInside(),
			insideObject = this.physics[inside.type][inside.id],
			insideObjectZ = insideObject.getZ(ball.getY());

		ball.setZ(inside.type == 'stage' && ballZ > insideObjectZ ? ballZ - 0.5 : insideObjectZ);

		if(inside.type == 'shuttle' && insideObject.isActive()) {
			ball.applyImpulse(insideObject.getForce());
		}*/
		ball.update();
        res[id] = { p: ball.getPosition() };
	});

    Object.keys(flippers).forEach(id => {
        var flipper = flippers[id];
        flipper.update();
        res[id] = { p: flipper.getPosition(), a: flipper.getAngle() };
    });

    this.world.step(1000 / 25);
    return res;
}

Pinball.prototype.updateFlipper = function(data) {
    this.physics.flipper[data.id].setActive(data.active);
}

Physic.types = {
    ball: function(world, def) { return new Ball(world, def); },
    flipper: function(world, def) { return new Flipper(world, def); },
    stage: function(world, def) { return new Stage(world, def); },
    bouncer: function(world, def) { return new Bouncer(world, def); },
    shuttle: function(world, def) { return new Shuttle(world, def); },
    sensor: function(world, def) { return new Sensor(world, def); },
    ramp: function(world, def) { return new Ramp(world, def); }
}

function Physic(world, def) {
    this.body = world.createBody({
		position: Vec2(def.position.x, def.position.y)
	});

    if(def.points && def.lines) {
        console.log('asd');
        this.createFixture(this.body, def);
    }

    this.position = def.position;
}

Physic.fylterCategory = {
	'ball': 0x0001,
	'stage': 0x0002,
	'ramp': 0x0004,
	'sensor': 0x0008,
	'shuttle': 0x0010,
};

Physic.prototype.getPosition = function() {
    return this.position;
}

Physic.prototype.createFixture = function(body, def) {
	var points = def.points,
		lines = def.lines;

	for(var i = 0; i < lines.length; i += 2) {
        var index1 = lines[i] * 3,
        	index2 = lines[i + 1] * 3;

        var x1 = points[index1],
        	y1 = points[index1 + 2],
        	x2 = points[index2],
        	y2 = points[index2 + 2];

        body.createFixture(pl.Edge(Vec2(x1, y1), Vec2(x2, y2)), 0);
    }
}

Physic.prototype.setFilterData = function(data) {
	var fixture = this.body.getFixtureList();
	while(fixture != null) {
		fixture.setFilterData(data);
		fixture = fixture.getNext();
	}
}

Physic.prototype.setSensor = function(sensor) {
	var fixture = this.body.getFixtureList();
	while(fixture != null) {
		fixture.setSensor(sensor);
		fixture = fixture.getNext();
	}
}

function Ball(world, def) {
    Physic.call(this, world, def);
    this.body.setDynamic();

	this.body.createFixture(pl.Circle(def.radius), def.mass);
	this.setFilterData({
		groupIndex: 0,
		categoryBits: Physic.fylterCategory.ball,
		maskBits: Physic.fylterCategory.ball | Physic.fylterCategory.sensor | Physic.fylterCategory.stage
	});

    this.position = def.position;
	this.body.setUserData({ inside: def.inside });
	this.radius = def.radius;
}

Ball.prototype = Object.create(Physic.prototype);

Ball.prototype.update = function() {
	var position = this.body.getPosition();
    this.position.x = position.x;
    this.position.y = position.y;
}

Ball.prototype.getY = function() {
	return this.position.y;
}

Ball.prototype.setZ = function(z) {
	this.position.z = z + this.radius;
}

Ball.prototype.getZ = function() {
	return this.position.z - this.radius;
}

Ball.prototype.getInside = function() {
	return this.body.getUserData().inside;
}

Ball.prototype.applyImpulse = function(impulse) {
	this.body.applyLinearImpulse(impulse, Vec2(0,0), true);
}

function Flipper(world, def) {
    Physic.call(this, world, def);
    this.body.setDynamic();
    this.body.setBullet(true);

	this.body.createFixture(pl.Circle(1), def.mass);

	this.orientation = def.orientation;
	this.velocity = { down: def.velocity.down, up: def.velocity.up };
	this.limits = { lower: def.limits.lower, upper: def.limits.upper };
    this.active = false;

	let optionJoint = {
		enableMotor: true,
		lowerAngle: this.limits.lower,
		upperAngle: this.limits.upper,
		enableLimit: true,
		collideConnected: false,
		maxMotorTorque: 150000
	};

	this.motor = world.createJoint(pl.RevoluteJoint(optionJoint, world.createBody(), this.body, Vec2(def.position.x, def.position.y)));
}

Flipper.prototype = Object.create(Physic.prototype);

Flipper.prototype.update = function() {
	this.body.setFixedRotation(false);

	if(this.orientation == 'right') {
		if(this.active) {
			if(this.motor.getJointAngle() >= this.limits.upper) {
				this.body.setAngle(this.limits.upper);
				this.body.setFixedRotation(true);
			}
		} else {
			if(this.motor.getJointAngle() <= this.limits.lower) {
				this.body.setAngle(this.limits.lower);
				this.body.setFixedRotation(true);
			}
		}
	} else {
		if(this.active) {
			if(this.motor.getJointAngle() <= this.limits.lower) {
				this.body.setAngle(this.limits.lower);
				this.body.setFixedRotation(true);
			}
		} else {
			if(this.motor.getJointAngle() >= this.limits.upper) {
				this.body.setAngle(this.limits.upper);
				this.body.setFixedRotation(true);
			}
		}
	}

	this.motor.setMotorSpeed(this.active ? this.velocity.up : this.velocity.down);

    this.angle = this.motor.getJointAngle();
}

Flipper.prototype.setActive = function(active) {
    this.active = active;
}

Flipper.prototype.getAngle = function() {
    return this.angle;
}

function Stage(world, def) {
    Physic.call(this, world, def);

	this.setFilterData({
		groupIndex: 0,
		categoryBits: def.mask ? Physic.fylterCategory[def.mask] : Physic.fylterCategory.stage,
		maskBits: 0xffff
	});
}

Stage.prototype = Object.create(Physic.prototype);

Stage.prototype.getZ = function(y) {
	return this.position.z;
}

/*
function Bouncer(world, def) {
    Physic.call(this, world, def);

	this.createFixture(this.body, def);
	this.setFilterData({
		groupIndex: 0,
		categoryBits: Physic.fylterCategory.stage,
		maskBits: 0xffff
	});

	this.bouncing = def.bouncing;

	world.on('end-contact', contact => {
		if(this.body == contact.getFixtureA().getBody()) {
			var ball = contact.getFixtureB().getBody(),
				velocity = ball.getLinearVelocity(),
				impulse = velocity.mul(1.5);

			if(Math.abs(impulse.x) < this.bouncing.min && Math.abs(impulse.y) < this.bouncing.min) {
				var bigger = Math.abs(velocity.x) > Math.abs(velocity.y) ? velocity.x : velocity.y;
				var multipler = Math.abs(this.bouncing.min / bigger);
				impulse = velocity.mul(multipler);
			} else if(Math.abs(impulse.x) > this.bouncing.max || Math.abs(impulse.y) > this.bouncing.max) {
				var bigger = Math.abs(velocity.x) > Math.abs(velocity.y) ? velocity.x : velocity.y;
				var divisor = Math.abs(bigger / this.bouncing.max);
				impulse = Vec2(velocity.x / divisor, velocity.y / divisor);
			}
			ball.applyLinearImpulse(impulse, Vec2(0, 0), true);
		}
	});
}

Bouncer.prototype = Object.create(Physic.prototype);

function Shuttle(world, def) {
    Physic.call(this, world, def);

	this.createFixture(this.body, def);
	this.setFilterData({
		groupIndex: 0,
		categoryBits: Physic.fylterCategory.shuttle,
		maskBits: 0xffff
	});

	this.force = Vec2(...def.force);

	document.body.addEventListener('keyup', evt => {
		if(evt.keyCode == def.activeKey) this.active = true;
	});
}

Shuttle.prototype = Object.create(Physic.prototype);

Shuttle.prototype.getZ = function() {
	return this.position.z;
}

Shuttle.prototype.isActive = function() {
	return this.active;
}

Shuttle.prototype.getForce = function() {
	return this.force;
}

function Sensor(world, def) {
    Physic.call(this, world, def);

	this.createFixture(this.body, def);
	this.setFilterData({
		groupIndex: 0,
		categoryBits: Physic.fylterCategory[def.mask],
		maskBits: 0xffff
	});
	this.setSensor(true);

	this.body.setUserData({ from: def.from, to: def.to });

	world.on('end-contact', contact => {
		var ball = contact.getFixtureB().getBody(),
			sensor = contact.getFixtureA().getBody();

		if(sensor == this.body) {
			var inside = ball.getUserData().inside;
			ball.setUserData(inside.id == def.from.id ? { inside: def.to } : { inside: def.from });
			ball.getFixtureList().setFilterData({
				groupIndex: 0,
				categoryBits: Physic.fylterCategory.ball,
				maskBits: Physic.fylterCategory.ball | Physic.fylterCategory.sensor | Physic.fylterCategory[ball.getUserData().inside.mask]
			});
		}
	});
}

Sensor.prototype = Object.create(Physic.prototype);

Sensor.prototype.getFrom = function() {
	return this.body.getUserData().from;
}

Sensor.prototype.getTo = function() {
	return this.body.getUserData().to;
}

function Ramp(world, def) {
    Physic.call(this, world, def);

	this.createFixture(this.body, def);
	this.setFilterData({
		groupIndex: 0,
		categoryBits: Physic.fylterCategory[def.mask],
		maskBits: 0xffff
	});

	this.createHeightMap(def);
}

Ramp.prototype = Object.create(Physic.prototype);

Ramp.prototype.createHeightMap = function(def) {
	this.heightMap = [];
	for(var i = 0; i < def.lines.length; i += 2) {
        let index1 = def.lines[i] * 3,
			index2 = def.lines[i + 1] * 3;

        if(def.points[index1 + 2] > def.points[index2 + 2]) {
            index2 = def.lines[i] * 3;
            index1 = def.lines[i + 1] * 3;
        }

		this.heightMap.push({
            z1: def.points[index1 + 1],
            y1: def.points[index1 + 2],
            z2: def.points[index2 + 1],
            y2: def.points[index2 + 2]
		});
	}
}

Ramp.prototype.getZ = function(y) {
	for(position of this.heightMap) {
        if(position.y1 < y && position.y2 > y) {
            let distance = Math.abs(position.y2 - position.y1);
            let distance2 = Math.abs(position.y1 - (y + 0.5));
            let porcentaje = distance2 / distance;
            let lol =  Math.abs(position.z1 - position.z2);
            let z = position.z1 - (lol * porcentaje);
            return -z;
            //console.log(ballPosition.y + ", " + position.y1 + ", " + position.y2 + "," + porcentaje + "," + z + "," + lol);
        }
	}
}

/////////////////////////////////
function setDefaults(to, from) {
	to = to || {};

	Object.keys(from).forEach(key => to[key] = to[key] || from[key]);

	return to;
}
*/
