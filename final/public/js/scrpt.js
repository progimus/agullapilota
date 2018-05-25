var socket = io(),
    user,
    scene;

window.onload = () => {
    //var scene = new Scene(document.body, sceneDef);

    $.ajax({
        url: '/user',
        type: 'GET',
        async: false,
        success: function(data) {
            user = data;
        }
    });

    var createSingleplayerGameBtn = document.getElementById('createSingleplayerGameBtn'),
        createMultiplayerGameBtn = document.getElementById('createMultiplayerGameBtn'),
        searchMultyplayerGameBtn = document.getElementById('searchMultyplayerGameBtn');

    createSingleplayerGameBtn.addEventListener('click', createSingleplayerGame);
    createMultiplayerGameBtn.addEventListener('click', createMultiplayerGame);
    searchMultyplayerGameBtn.addEventListener('click', searchMultiplayerGame);


    socket.emit('createGame', {
        username: user.username
    });

    socket.on('loadScene', sceneDef => {
        scene = new Scene(document.body, sceneDef);
    });

    //scene.start();
}

function createSingleplayerGame(evt) {
    socket.emit('createGame', {
        type: 'singleplayer',
        username: user.username
    });
}

function createMultiplayerGame(evt) {
    socket.emit('createGame', {
        type: 'multiplayer',
        username: user.username
    });
}

function searchMultiplayerGame(evt) {
    socket.emit('searchGame', {
        username: user.username
    });
}

function loadScene(sceneDef) {
    console.log(sceneDef);
}
