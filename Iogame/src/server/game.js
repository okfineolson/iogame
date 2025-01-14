const Constants = require('../shared/constants');
const Player = require('./player');
const applyCollisions = require('./collisions');
const applychestCollisions = require('./chestcollisions');
const Chest = require('./chest');
const Obstacle = require('./obstacle');
const { constant, pick } = require('lodash');
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
  checkinobst(obstacles,x,y){
    obstacles.forEach(obstacle=>{
      const dx = obstacle.x - x;
      const dy = obstacle.y - y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if(distance <= 300){
        //console.log("rerandom!")
        //console.log(obstacles)
        //console.log(x,y)
        return 1;
      }
    })
    return 0;
  }
  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
    var check = 1
    while(check != 0){
      var x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
      var y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
     
      check = this.checkinobst(this.obstacle,x,y)
    }
    this.players[socket.id] = new Player(socket.id, username, x, y);

    
  }
  addchest() {
  
  for (var i=0;i<5;i++){
    
    
    var check = 1
    while(check != 0){
      var x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
      var y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
      
      check = this.checkinobst(this.obstacle,x,y)
    }
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
        this.players[socket.id].setstDirection(0.01)
      }else if(dir == -998){
        //console.log("no its here998")
        this.players[socket.id].openclosefire()
      }else if(dir == -997){
        //console.log("no its here")
        this.players[socket.id].setBetrayalState()
      }else{
        
        if(this.players[socket.id].direction == 0.01){
          this.players[socket.id].setspeed(Constants.PLAYER_SPEED);
          this.players[socket.id].setstDirection(dir)
          return;
        }
        this.players[socket.id].setspeed(Constants.PLAYER_SPEED);

        if(this.players[socket.id].direction>-Math.PI&&this.players[socket.id].direction<=Math.PI){
          if(this.players[socket.id].direction < dir){
            if(dir - this.players[socket.id].direction <=Math.PI){
              dir = this.players[socket.id].direction + Math.PI/10
            }else{
              dir = this.players[socket.id].direction - Math.PI/10
              if(dir<=-Math.PI){
                dir = Math.PI
              }
            }
          }else{
            if(this.players[socket.id].direction - dir <=Math.PI){
              dir = this.players[socket.id].direction - Math.PI/10
            }else{
              dir = this.players[socket.id].direction + Math.PI/10
              if(dir>=Math.PI){
                dir = -Math.PI
              }
            }
          }
          this.players[socket.id].setstDirection(dir )
        }else{
          this.players[socket.id].setstDirection(dir)
        }
        
        
      }
    }
  }
  handlebltInput(socket, dir) {
    if(this.players[socket.id]){
      this.players[socket.id].setbltDirection(dir);
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
        const hyaku = 100
        this.chests.push(new Chest(i, x, y, 0 ))
        this.obstacle.push(new Obstacle(i,x,y,hyaku,hyaku))
        //this.obstacle.push(new Obstacle(i,x+50,y+150,10,50))
      }
    })
    this.obstacle = this.obstacle.filter(obst => !obstToRemove.includes(obst))
    this.chests = this.chests.filter(chest => !chestsToRemove.includes(chest));
    
    let outputarr = applychestCollisions(this.chests, this.bullets,this.players,this.obstacle);
    let destroyedBulletsfromchest= outputarr[0]
    this.obstacle = outputarr[1]
    this.bullets = this.bullets.filter(bullet => !destroyedBulletsfromchest.includes(bullet));
    
    //check if player hit the obstacle
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      for(const obse of this.obstacle){
        const newxy =  obse.inrange(player.x,player.y,Constants.PLAYER_RADIUS,player.lastx,player.lasty)
        
        player.x = newxy[0]
        player.y = newxy[1]
      }
      player.flashback(player.x,player.y)
    });
    
    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      const newBullet = player.update(dt,this.chests,player);
      if (newBullet) {
        this.bullets.push(newBullet);
      }
    });

    // Apply collisions, give players score for hitting bullets
    const destroyedBullets = applyCollisions(Object.values(this.players), this.bullets,this.players);

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
    const nearbyObstacle = this.obstacle.filter(
      c => c.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    //console.log(nearbyObstacle.map(c => c.serializeForUpdate()))
    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      chest: nearbyChest.map(c => c.serializeForUpdate()),
      obstacle: nearbyObstacle.map(c => c.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
