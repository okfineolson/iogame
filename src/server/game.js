const Constants = require('../shared/constants');
const Player = require('./player');
const applyCollisions = require('./collisions');
const applychestCollisions = require('./chestcollisions');
const Chest = require('./chest');
const Obstacle = require('./obstacle');
const { constant } = require('lodash');
class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.bullets = [];
    this.chests = [];
    this.obstacle = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 60);
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.players[socket.id] = new Player(socket.id, username, x, y);

    
  }
  addchest() {
  
  for (var i=0;i<5;i++){
    
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.chests[i] = new Chest(i, x, y, 0 );
    this.obstacle[i] = new Obstacle(i,x,y,100,100)
  }
  }
  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }


  handleInput(socket, dir) {
    if (this.players[socket.id]) {
      if(dir == -999){
        this.players[socket.id].setspeed(0);
      }else if(dir == -998){
        this.players[socket.id].openclosefire()
      }else{
        this.players[socket.id].setspeed(Constants.PLAYER_SPEED);
        this.players[socket.id].setstDirection(dir);
      }
    }
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each bullet
    const bulletsToRemove = [];
    this.bullets.forEach(bullet => {
      if (bullet.update(dt)) {
        // Destroy this bullet
        bulletsToRemove.push(bullet);
      }
    });
    this.bullets = this.bullets.filter(bullet => !bulletsToRemove.includes(bullet));
    //update each chest
    const chestsToRemove = [];
    const obstToRemove = [];
    this.chests.forEach(chest => {
      //console.log(chest.hp)
      if (chest.hp <= 0 && this.chests != undefined) {
        // Destroy this bullet
        chestsToRemove.push(chest);
        this.obstacle.forEach(ob =>{
          if(ob.id == chest.id){
            obstToRemove.push(ob);
          }})
        const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
        const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
        var i = this.chests[this.chests.length-1].id+1
        
        this.chests.push(new Chest(i, x, y, 0 ))
        this.obstacle.push(new Obstacle(i,x,y,100,100))
      }
    })
    this.obstacle = this.obstacle.filter(obst => !obstToRemove.includes(obst))
    this.chests = this.chests.filter(chest => !chestsToRemove.includes(chest));
    
    
    const destroyedBulletsfromchest = applychestCollisions(this.chests, this.bullets,this.players);

    this.bullets = this.bullets.filter(bullet => !destroyedBulletsfromchest.includes(bullet));
    
    //check if player hit the obstacle
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      for(const obse of this.obstacle){
        const newxy =  obse.inrange(player.x,player.y,Constants.PLAYER_RADIUS)
        
        player.x = newxy[0]
        player.y = newxy[1]
      }
    });

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      const newBullet = player.update(dt);
      if (newBullet) {
        this.bullets.push(newBullet);
      }
    });

    // Apply collisions, give players score for hitting bullets
    const destroyedBullets = applyCollisions(Object.values(this.players), this.bullets);

    destroyedBullets.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage();
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBullets.includes(bullet));


    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyBullets = this.bullets.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );

    const nearbyChest = this.chests.filter(
      c => c.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      chest: nearbyChest.map(c => c.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
