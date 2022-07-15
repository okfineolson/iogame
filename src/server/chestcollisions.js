const Constants = require('../shared/constants');

function applychestCollisions(chests, bullets,parents) {
    const destroyedBullets = [];
    for (const element of bullets) {
      // Look for a player (who didn't create the bullet) to collide each bullet with.
      // As soon as we find one, break out of the loop to prevent double counting a bullet.
      for (let j = 0; j < chests.length; j++) {
        const bullet = element;
        const chest = chests[j];
        if (chest.distanceTochest(bullet) <= 50) {
          destroyedBullets.push(bullet);

          if(chest.checkinconsole(parents[bullet.parentID])){
            chest.addplayers(bullet.parentID)
            if(chest.players.length == 2){
              chest.takeBulletDamage();
            }
            console.log(chest.players)
          }else{
            chest.removePlayer(bullet.parentID)
          }
          
          break;
        }
      }
    }
    return destroyedBullets;
  }
  module.exports = applychestCollisions;