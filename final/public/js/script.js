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
        playMultiplayerBtn = document.getElementById('playMultiplayerBtn'),
        exitBtn = document.getElementById('exitBtn');

    playSingleplayerBtn.addEventListener('click', playSingleplayer);
    playMultiplayerBtn.addEventListener('click', playMultiplayer);
    exitBtn.addEventListener('click', exit);

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

    window.addEventListener('resize', () => scene.resize());

}

function playSingleplayer(evt) {
    multiplayerBtn = document.getElementById('playMultiplayerBtn');
    if(multiplayerBtn != 'Multiplayer') {
        multiplayerBtn.classList.remove('selected');
        multiplayerBtn.textContent = 'Multiplayer';
        exit();
    }
    socket.emit('playGame', {
		level: {
			type: 'singleplayer',
			name: 'singleplayer'
		},
		user: user
    });
}

function playMultiplayer(evt) {
    btn = evt.target;
    if(btn.textContent == 'Multiplayer') {
        socket.emit('playGame', {
    		level: {
    			type: 'multiplayer',
    			name: 'multiplayer'
    		},
    		user: user
        });
        btn.classList.add('selected');
        btn.textContent = 'Esperando...';
    } else {
        btn.classList.remove('selected');
        btn.textContent = 'Multiplayer';
        exit();
    }
}

function exit() {
    closeGame();
    socket.emit('leaveGame');
}

function loadScene(data) {
    var btn = document.getElementById('playMultiplayerBtn');
    btn.classList.remove('selected');
    btn.textContent = 'Multiplayer';

    var gameContainer = document.getElementById('gameContainer')
    document.getElementById('menuContainer').style.display = 'none';
    gameContainer.style.display = 'block';
    scene = new Scene(socket.id, data.players, gameContainer, data.sceneDef);
    scene.start()
}

function updateScene(data) {
    scene.update(data);
}

function playerDisconnects(message) {
    var div = document.createElement('div'),
        br = document.createElement('br'),
        link = document.createElement('a');

    div.classList.add('messageDiv')
    div.textContent = message;
    div.style.display = 'block';
    div.appendChild(br);
    link.href = '#';
    link.textContent = 'Continuar';
    link.addEventListener('click', exit);
    div.appendChild(link);

    var container = document.getElementById('gameContainer');
    container.insertBefore(div, container.lastElementChild);
}

function closeGame() {
    var menuContainer = document.getElementById('menuContainer'),
        gameContainer = document.getElementById('gameContainer');
    menuContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    [...gameContainer.children]
        .filter(e => e.id != 'exitBtn')
        .forEach(e => e.parentNode.removeChild(e));
}
