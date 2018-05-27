const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    Game = require('./Game.js');

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

var games = { waiting: {}, playing: {} };

io.on('connection', socket => {
    console.log(socket.id)
    socket.on('playGame', data => playGame(socket, data));
    socket.on('updateFlipper', (data) => updateFlipper(socket, data));
    socket.on('spacePressed', (data) => updateShuttle(socket, data));
    socket.on('disconnect', () => leaveGame(socket));
    socket.on('leaveGame', () => leaveGame(socket));

});

function createGame(id, level) {
        //console.log(JSON.stringify(require('./public/levels/multiplayer/level.js')));
        game = new Game(id, level.name);
    return game;
}

function createGameId() {
    return Math.random().toString(36).slice(2);
}

function joinGame(socket, username, game) {
    var gameId = game.getId();
    socket.join(gameId);
    socket.gameId = gameId;
    game.addPlayer(socket.id, username);
}

function startGame(game) {
    var sceneDef = require('./public/levels/' + game.getLevelName() + '/scene.json');
    io.to(game.getId()).emit('loadScene', {
        players: game.players,
        sceneDef: sceneDef
    });
}

function playGame(socket, data) {
    if(!socket.gameId) {
        var username = data.user.username,
            level = data.level;
        if(level.type == 'singleplayer') {
            var gameId = createGameId(),
                game = new Game(gameId, level.name);

            joinGame(socket, username, game);
            games.playing[gameId] = game;

            startGame(games.playing[gameId]);
        } else {
            if(Object.keys(games.waiting).length) {
                var gameId = Object.keys(games.waiting)[0],
                    game = games.waiting[gameId];
                joinGame(socket, username, game);
                if(game.nPlayers == game.maxPlayers) {
                    games.playing[gameId] = game;
                    delete games.waiting[gameId];
                    startGame(game);
                }
            } else {
                var gameId = createGameId(),
                    game = createGame(gameId, level);
                joinGame(socket, username, game);

                games.waiting[gameId] = game;
            }
        }
    }
}

function updateFlipper(socket, data) {
    var game = games.playing[socket.gameId];
    if(game)
        game.updateFlipper(socket.id, data);
}

function updateShuttle(socket, data) {
    var game = games.playing[socket.gameId];
    if(game)
        game.updateShuttle(data);
}

function leaveGame(socket) {
    var gameId = socket.gameId;
    io.to(gameId).emit('playerDisconnects');
    delete games.waiting[gameId];
    delete games.playing[gameId];
    delete socket.gameId;
}

//Server
http.listen(3000, function() {
    console.log('listening on *:3000');
    setInterval(() => {
        Object.entries(games.playing).forEach(game => {
            var gameId = game[0],
                game = game[1];

            res = game.update();
            io.to(gameId).emit('updateScene', game.update());
        });
    }, 1000 / 100);
});
