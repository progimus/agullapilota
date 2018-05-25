const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    Pinball = require('./pinball.js'),
    physics = require('./public/levels/multiplayer/level1/physics.js');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

/*
app.get(/)
	if(!loged) res.redirect(/login)
	else res.render(index)
*/

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/user', (req, res) => {
    res.json({ username: 'player1' });
});

app.get('/singleplayer', (req, res) => {
    console.log('singleplayer')
    res.render('singleplayer.ejs', { elementsUrl: 'levels/singleplayer/level1/scene.js' });
});

app.get('/multiplayer', (req, res) => {
    res.render('multiplayer', { elementsUrl: 'levels/multiplayer/level1/scene.js' });
});

var games = {
    singleplayer: {},
    multiplayer: {}
}

io.on('connection', socket => {
    console.log('User connected');

    socket.on('createGame', data => {
        var gameType = data.type ? data.type : 'singleplayer',
            roomId = Math.random().toString(36).slice(2);

        socket.join(roomId);
        games[gameType][roomId] = new Pinball(physics);

        var sceneDef = require('./public/levels/' + gameType + '/level1/scene.json');
        socket.emit('loadScene', sceneDef);
    });
    /*var pinball = new Pinball(physics);

    socket.on('flipper', function(data) {
        pinball.updateFlipper(data);
    });

    var start = () => {
        setInterval(() => {
            var data = pinball.update();
            io.emit('update', data);
        }, 1000 / 100);
    }

    start();*/
});

//Server
http.listen(3000, function(){
    console.log('listening on *:3000');
});
