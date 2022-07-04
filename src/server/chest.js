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
}
module.exports = Chest;