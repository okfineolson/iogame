const ObjectClass = require('./object');

const Constants = require('../shared/constants');

class Chest extends ObjectClass {
  constructor(id, x, y,state) {
    super(id, x, y, state);
    this.hp = Constants.CHEST_MAX_HP;
    this.state = 0
    this.players = []
    this.checkopen = Constants.CHEST_OPENSTATE
    this.playerbuffer = []
    
  }
  update(dt) {
    super.update(dt);
    return this.hp <= 0;
  }
  addplayers(playerID){
    this.removePlayer(playerID)
    this.players.push(playerID)
  }
  addplayerbuffer(player){
    this.playerbuffer.push(player)
  }
  removePlayer(playerID){
    this.players = this.players.filter(item => item != playerID)
  }
  
  takeBulletDamage() {
    this.hp -= Constants.BULLET_DAMAGE;
  }
  updateState() {
    this.state += 1;
  }
  updateCheckopen() {
    this.checkopen += 1;
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      hp: this.hp,
      checkopen:this.checkopen,
    };
  }
}


module.exports = Chest;