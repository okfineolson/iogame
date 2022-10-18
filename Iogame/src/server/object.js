class Object {
  constructor(id, x, y, dir,speed) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.bltdirection = dir;
    this.speed = speed;
    this.lastx = x;
    this.lasty = y;
  }

  update(dt) {
    
    this.x += dt * this.speed * Math.sin(this.direction);
    this.y -= dt * this.speed * Math.cos(this.direction);
   
  }

  distanceTo(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  distanceTochest(object,w,h) {
    const dx = this.x+w - object.x;
    const dy = this.y+h - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  checkinconsole(object){
    if(object == null){
      return false
    }
    var dx = this.x+50 - object.x;
    var dy = this.y+150 - object.y;
    const console_A = Math.sqrt(dx * dx + dy * dy)
    dx = this.x - object.x;
    dy = this.y+150 - object.y;
    const console_B = Math.sqrt(dx * dx + dy * dy)
    return console_A<=50 || console_B <=50
    
  }
  checkinrange(object){
    var dx = this.x+50 - object.x;
    var dy = this.y+100 - object.y;
    const console_A = Math.sqrt(dx * dx + dy * dy)
    return console_A <= 150
  }
  setDirection(dir) {
    this.direction = dir;
  }
  setspeed(spd) {
    this.speed = spd;
  }

  flashback(x,y) {
    this.lastx = x;
    this.lasty = y;
  }
  setstDirection(dir) {
    this.direction = dir;
  }
  setbltDirection(dir){
    this.bltdirection = dir;
  }
  
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }
}

module.exports = Object;
