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

    socket.on('loadScene', data => {
        scene = new Scene(document.body, data);
		//scene.setPlayer(data.player);
		scene.start()
    });

	socket.on('playerDisconnects', () => {
		console.log('El contrincante se ha desconectado, tu ganas.');
	});

    //scene.start();
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

function loadScene(sceneDef) {
    console.log(sceneDef);
}
