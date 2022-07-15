const ObjectClass = require('./object');

const Constants = require('../shared/constants');

class Obstacle extends ObjectClass {
  constructor(id, x, y, w ,h) {
    super(id, x, y, w ,h);
    
  }
  update(dt) {
    super.update(dt);
    return this.hp <= 0;
  }
  inrange(x , y, radius) {
    const xrange = x + radius
    const yrange = y + radius
    var returnx = x
    var returny = y
    
    if((xrange > this.x) && (xrange < (this.x + 100)&& yrange > this.y && yrange < (this.y + 100))){
        
        if(((yrange - this.y) < (this.y + 100 - yrange)) ){
          returny = Math.min(yrange,this.y)   
          if((xrange - this.x) < (this.x + 100 - xrange)){
            returnx = Math.min(xrange,this.x)
            return [x,returny]
          }else{
            returnx = Math.max(xrange,(this.x + 100))
            return [x,returny]
          } 
          
        }else{
          returny = Math.max(yrange,(this.y + 100))
          if((xrange - this.x) < (this.x + 100 - xrange)){
            returnx = Math.min(xrange,this.x)
            return [returnx,y]
          }else{
            returnx = Math.max(xrange,(this.x + 100))
            return [returnx,y]
          } 
        }
    }
    return [x,y]
  }
}


module.exports = Obstacle;