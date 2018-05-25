module.exports = Game;

function Game(id, def) {
    this.id = id;
    this.type = def.type;

    this.nPlayers = 0;
    this.maxPlayers = def.maxPlayers;
    this.players = {};
    //this.physics = new Physics();
}

Game.prototype.addPlayer = function(id, username) {
    this.players[id] = {
        username: username,
        camera: 'camera' + (++this.nPlayers),
        balls: {},
        flippers: {}
    };
}

Game.prototype.getId = function() {
    return this.id;
}

Game.prototype.getType = function() {
    return this.type;
}

Game.prototype.getPlayers = function() {
    return this.players;
}

Game.prototype.isVoid = function() {
    return this.nPlayers < this.maxPlayers ? true : false;
}
