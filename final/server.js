const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    Pinball = require('./pinball.js'),
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

var games = {
    waiting: {},
    playing: {}
};

io.on('connection', socket => {
    console.log('User connected');

    socket.on('playGame', data => {
        if(data.level.type == 'singleplayer') {
            var game = createGame(id, data);
            game.addPlayer(socket.id, data.user.username);

            var id = Math.random().toString(36).slice(2);
            socket.join(id);
            socket.gameId = id;
            games.playing[id] = game;

            startGame(game, data);
        } else {
            if(games.waiting.length) {
                var game = games.waiting[0],
                    id = game.getId();

                socket.join(id);
                game.addPlayer(data.user.username);
                if(game.nPlayers == game.maxPlayers) {
                    delete games[id];
                    startGame(game, data);
                }
            } else {
                var game = createGame(id, data);
                game.addPlayer(socket.id, data.user.username);

                var id = Math.random().toString(36).slice(2);
                socket.join(id);
                socket.gameId = id;
                games.waiting[id] = game;
            }
        }
        console.log(games)
    });
    socket.on('disconnect', leaveGame);
    socket.on('leaveGame', leaveGame);
});

function createGame(id, data) {
    var levelDef = require('./public/levels/' + data.level.name + '/physics.js'),
        game = new Game(id, levelDef);
    return game;
}

function startGame(game, data) {
    console.log('Starting game')
    var sceneDef = require('./public/levels/' + data.level.name + '/scene.json');
    io.sockets.in(game.getId()).emit('loadScene', sceneDef);
}

function leaveGame() {
    var waitingGames = Object.values(games.waiting),
        playingGames = Object.values(games.playing),
        allGames = waitingGames.concat(playingGames);

    var id = allGames.find(game => game.getPlayers().toArray)
}

function getGameIndex(id, state) {
    games[state].findIndex()
}

var start = () => {
    setInterval(() => {
        Object.entries(games.singleplayer)
            .concat(Object.entries(games.multiplayer))
            .forEach(game => {
                console.log(game);
                io.sockets.in(game[0])
                    .emit('update', game[1].update());
            });
    }, 1000 / 100);
}

//start();

//Server
http.listen(3000, function(){
    console.log('listening on *:3000');
});
