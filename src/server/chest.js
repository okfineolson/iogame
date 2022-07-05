const ObjectClass = require('./object');

const Constants = require('../shared/constants');

class Chest extends ObjectClass {
  constructor(id, x, y,state) {
    super(id, x, y, state);
  }
  update(dt) {
    super.update(dt);
    return this.state;
  }
  removechest() {
    this.state = 1;
  }
}


module.exports = Chest;