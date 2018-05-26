var physics = require('./physics.json');
module.exports = {
    maxPlayers: 2,
    levelType: 'multiplayer',
    levelName: 'multiplayer',
    players: {
        player1: {
            balls: ['ball1'],
            flippers: {
                left: ['p1leftFlipper'],
                right: ['p1rightFlipper']
            },
            camera: 'camera1'
        },
        player2: {
            balls: ['ball1'],
            flippers: {
                left: ['p2leftFlipper'],
                right: ['p2rightFlipper']
            },
            camera: 'camera2'
        }
    },
    world: {
        gravity: { x: 0, y: -5 }
    },
    physics: {
        ball: {
            type: 'ball',
            position: { x: 50, y: 100, z: 1.5 },
            radius: 2,
            inside: {
                mask: 'stage',
                type: 'stage',
                id: 'stage'
            },
            mass: 1
        },
        stage: {
            type: 'stage',
            points: physics.stage.points,
            lines: physics.stage.lines,
            mask: 'stage'
        },
        bouncer1: {
            type: "bouncer",
            points: physics.bouncer1.points,
            lines: physics.bouncer1.lines,
            bouncing: { min: 8, max: 15 }
        },
        bouncer2: {
            type: "bouncer",
            points: physics.bouncer2.points,
            lines: physics.bouncer2.lines,
            bouncing: { min: 8, max: 15 }
        },
        leftRampSensors: {
            type: 'sensor',
            points: physics.leftRampSensors.points,
            lines: physics.leftRampSensors.lines,
            mask: 'sensor',
            in: {
                mask: 'ramp',
                type: 'ramp',
                id: 'leftRamp'
            },
            out: {
                mask: 'stage',
                type: 'stage',
                id: 'stage1'
            }
        },
        rightRampSensors: {
            type: 'sensor',
            points: physics.rightRampSensors.points,
            lines: physics.rightRampSensors.lines,
            mask: 'sensor',
            in: {
                mask: 'ramp',
                type: 'ramp',
                id: 'rightRamp'
            },
            out: {
                mask: 'stage',
                type: 'stage',
                id: 'stage1'
            }
        },
        gravitySensor: {
            type: 'gravitySensor',
            points: physics.gravitySensor.points,
            lines: physics.gravitySensor.lines
        },
        leftRamp: {
            type: 'ramp',
            points: physics.leftRamp.points,
            lines: physics.leftRamp.lines,
            mask: 'ramp',
            heightMap: {
                points: physics.leftRampHeightmap.points,
                lines: physics.leftRampHeightmap.lines
            }
        },
        rightRamp: {
            type: 'ramp',
            points: physics.rightRamp.points,
            lines: physics.rightRamp.lines,
            mask: 'ramp',
            heightMap: {
                points: physics.rightRampHeightmap.points,
                lines: physics.rightRampHeightmap.lines
            }
        },
        p1leftFlipper: {
            type: "flipper",
            position: { x: 29.28, y: 12.42, z: 0 },
            mass: 50,
            points: physics.p1LeftFlipper.points,
            lines: physics.p1LeftFlipper.lines,
            active: false,
            orientation: "right",
            direction: 'up',
            velocity: { "down": -30, "up": 30 },
            limits: { "lower": -0.52, "upper": 0.52 }
        },
        p1rightFlipper: {
            type: "flipper",
            position: { x: 55.27, y: 12.42, z: 0 },
            mass: 50,
            points: physics.p1RightFlipper.points,
            lines: physics.p1RightFlipper.lines,
            active: false,
            orientation: "left",
            direction: 'up',
            velocity: { "down": 30, "up": -30 },
            limits: { "lower": -0.52, "upper": 0.52 }
        },
        p2leftFlipper: {
            type: "flipper",
            position: { x: 55.27, y: 260.17, z: 0 },
            mass: 50,
            points: physics.p2LeftFlipper.points,
            lines: physics.p2LeftFlipper.lines,
            active: false,
            orientation: "left",
            direction: 'down',
            velocity: { "down": -30, "up": 30 },
            limits: { "lower": -0.52, "upper": 0.52 }
        },
        p2rightFlipper: {
            type: "flipper",
            position: { x: 29.28, y: 260.17, z: 0 },
            mass: 50,
            points: physics.p2RightFlipper.points,
            lines: physics.p2RightFlipper.lines,
            active: false,
            orientation: "right",
            direction: 'down',
            velocity: { "down": 30, "up": -30 },
            limits: { "lower": -0.52, "upper": 0.52 }
        }
    }
}
