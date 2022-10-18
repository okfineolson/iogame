const Constants = require('../shared/constants');

// Returns an array of bullets to be destroyed.
function applyCollisions(players, bullets,parents) {
  const destroyedBullets = [];
  for (const element of bullets) {
    // Look for a player (who didn't create the bullet) to collide each bullet with.
    // As soon as we find one, break out of the loop to prevent double counting a bullet.
    for (let j = 0; j < players.length; j++) {
      const bullet = element;
      const player = players[j];
      if (
        bullet.parentID !== player.id &&
        player.distanceTo(bullet) <= Constants.PLAYER_RADIUS + Constants.BULLET_RADIUS
      ) {
        if(player.insamechest != "nothing" ||  parents[bullet.parentID].insamechest!= "nothing"){
          //console.log(player.insamechest)
          break;
        }
        destroyedBullets.push(bullet);
        player.takeBulletDamage();
        break;
      }
    }
    
  }
  return destroyedBullets;
}



module.exports = applyCollisions;

