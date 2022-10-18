const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_SPEED,username);
    this.username = username+"";
    this.hp = Constants.PLAYER_MAX_HP;
    this.fireCooldown = 0;
    this.score = 0;
    this.shootstate = 1;
    this.cooperationState = 0;
    this.insamechest = "nothing"
    this.inconsolestate = 0
    this.id = id
  }

  // Returns a newly created bullet, or null.
  update(dt,chests,player) {
    for (let j = 0; j < chests.length; j++) {
        
      const chest = chests[j];
      if(chest.checkinconsole(player)){
        this.Updateinconsolestate()
        break;
      }else{
        this.removeinconsolestate()
      }
      
    }
    super.update(dt,chests);

    // Update score
    //this.score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));
    // Fire a bullet, if needed
    this.fireCooldown -= dt;
    
    if(this.hp < 100){
      this.hp += 0.05
      if(this.hp > 100){
        this.hp = 100
      }
    }
    //console.log(this.fireCooldown)
    if (this.fireCooldown <= 0) {
      this.fireCooldown += Constants.PLAYER_FIRE_COOLDOWN;
      if(this.shootstate == 0){
        return null;
      }
      this.shootstate = 0
      return new Bullet(this.id, this.x, this.y, this.bltdirection);
    }

    return null;
  }

  openclosefire() {
    if(this.shootstate == 0){
      this.shootstate = 1
    }
    /*else{
      this.shootstate = 0
    }*/
  }
  takeBulletDamage() {
    this.hp -= Constants.BULLET_DAMAGE;
  }
  Updatesamechest(id) {
    this.insamechest = id ;
  }
  Updateinconsolestate() {
    this.inconsolestate = 1 ;
  }
  removeinconsolestate() {
    this.inconsolestate = 0;
  }
  Leavesamechest() {
    this.insamechest = "nothing";
  }
  onDealtDamage() {
    this.score += Constants.SCORE_BULLET_HIT;
  }
  setBetrayalState() {
    //console.log(this.cooperationState)
    if(this.cooperationState == 0){
      this.cooperationState = 1
    }else{
      this.cooperationState = 0
    }
  }
  onOpenChest(score) {
    this.score += score;
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      hp: this.hp,
      bltdirection: this.bltdirection,
      username:this.username,
      cooperationState:this.cooperationState,
      insamechest:this.insamechest,
      inconsolestate:this.inconsolestate,
      
    };
  }
}

module.exports = Player;
