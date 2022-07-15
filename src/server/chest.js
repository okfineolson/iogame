const ObjectClass = require('./object');

const Constants = require('../shared/constants');

class Chest extends ObjectClass {
  constructor(id, x, y,state) {
    super(id, x, y, state);
    this.hp = Constants.CHEST_MAX_HP;
    this.state = 0
    this.players = []
  }
  update(dt) {
    super.update(dt);
    return this.hp <= 0;
  }
  addplayers(playerID){
    this.removePlayer(playerID)
    this.players.push(playerID)
  }
  removePlayer(playerID){
    this.players = this.players.filter(item => item != playerID)
  }
  removechest() {
    this.state = 1;
  }
  takeBulletDamage() {
    this.hp -= Constants.BULLET_DAMAGE;
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      hp: this.hp,
    };
  }
}


module.exports = Chest;