var socket = io(),
    user,
    scene;

window.onload = () => {
    $.ajax({
        url: '/user',
        type: 'GET',
        async: false,
        success: function(data) {
            user = data;
        }
    });

    var playSingleplayerBtn = document.getElementById('playSingleplayerBtn'),
        playMultiplayerBtn = document.getElementById('playMultiplayerBtn');
    playSingleplayerBtn.addEventListener('click', playSingleplayer);
    playMultiplayerBtn.addEventListener('click', playMultiplayer);

    socket.on('loadScene', loadScene);
    socket.on('updateScene', updateScene);
	socket.on('playerDisconnects', playerDisconnects);

    document.body.addEventListener('keydown', evt => {
        if(evt.keyCode == 37) socket.emit('updateFlipper', { active: true, side: 'left' });
        if(evt.keyCode == 39) socket.emit('updateFlipper', { active: true, side: 'right' });
        if(evt.keyCode == 32) socket.emit('spacePressed', true);
    });

    document.body.addEventListener('keyup', evt => {
        if(evt.keyCode == 37) socket.emit('updateFlipper', { active: false, side: 'left' });
        if(evt.keyCode == 39) socket.emit('updateFlipper', { active: false, side: 'right' });
        if(evt.keyCode == 32) socket.emit('spacePressed', false);
    });
}

function playSingleplayer(evt) {
    socket.emit('playGame', {
		level: {
			type: 'singleplayer',
			name: 'singleplayer'
		},
		user: user
    });
}

function playMultiplayer(evt) {
    socket.emit('playGame', {
		level: {
			type: 'multiplayer',
			name: 'multiplayer'
		},
		user: user
    });
}

function loadScene(data) {
    scene = new Scene(socket.id, data.players, document.body, data.sceneDef);
    scene.start()
}

function updateScene(data) {
    scene.update(data);
}

function playerDisconnects() {
    console.log('El contrincante se ha desconectado, tu ganas.');
}
