const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    Pinball = require('./pinball.js'),
    physics = require('./physics.js');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/multiplayer', (req, res) => {
    res.render('multiplayer');
});

var players = [];

io.on('connection', socket => {
    console.log('User connected');
    players.push(socket.id);
    if(players.length == 1) {
        var pinball = new Pinball({
            player1: {
                flippers: ['flipperPlayer1Left'],
                flippers: ['flipperPlayer1Right']
            },
            player2: {
                flippers: ['flipperPlayer1Left'],
                flippers: ['flipperPlayer1Right']
            },
            world: {
                gravity: [0, -10]
            },
            physics: {
                ball1: {
                    type: 'ball',
                    position: { x: 7, y: 100, z: 2.5 },
                    radius: 2.5
                },
                stage: {
                    type: 'stage',
                    position: { x: 0, y: 0, z: 0 },
                    points: physics.stage1.points,
                    lines: physics.stage1.lines
                },
                p1leftFlipper: {
                    type: "flipper",
                    position: { x: 30.9, y: 8.29, z: 3 },
                    mass: 50,
                    points: physics.leftFlipper.points,
                    lines: physics.leftFlipper.lines,
                    active: false,
                    orientation: "right",
                    velocity: { "down": -30, "up": 30 },
                    limits: { "lower": -0.52, "upper": 0.52 }
                },
                p1rightFlipper: {
                    type: "flipper",
                    position: { x: 54.10, y: 8.29, z: 3 },
                    mass: 50,
                    points: physics.rightFlipper.points,
                    lines: physics.rightFlipper.lines,
                    active: false,
                    orientation: "left",
                    velocity: { "down": 30, "up": -30 },
                    limits: { "lower": -0.52, "upper": 0.52 }
                }
            }
        });

        socket.on('flipper', function(data) {
            console.log(data);
            pinball.updateFlipper(data);
        });

        var start = () => {
            setInterval(() => {
                var data = pinball.update();
                io.emit('update', data);
            }, 1000 / 60);
        }

        start();
    }
});
//Server
http.listen(3000, function(){
    console.log('listening on *:3000');
});
