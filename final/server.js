const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    Pinball = require('./pinball.js'),
    physics = require('./public/levels/multiplayer/level1/physics.js');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/singleplayer', (req, res) => {
    res.render('singleplayer.ejs', { elementsUrl: 'levels/singleplayer/level1/elements.js' });
});

app.get('/multiplayer', (req, res) => {
    res.render('multiplayer', { elementsUrl: 'levels/multiplayer/level1/elements.js' });
});

var players = [];

io.on('connection', socket => {
    console.log('User connected');
    players.push(socket.id);
    if(players.length == 1) {
        var pinball = new Pinball(physics);

        socket.on('flipper', function(data) {
            pinball.updateFlipper(data);
        });

        var start = () => {
            setInterval(() => {
                var data = pinball.update();
                io.emit('update', data);
            }, 1000 / 100);
        }

        start();
    }
});
//Server
http.listen(3000, function(){
    console.log('listening on *:3000');
});
