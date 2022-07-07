const Constants = require('../shared/constants');

function applychestCollisions(chests, bullets) {
    const destroyedBullets = [];
    for (const element of bullets) {
      // Look for a player (who didn't create the bullet) to collide each bullet with.
      // As soon as we find one, break out of the loop to prevent double counting a bullet.
      for (let j = 0; j < chests.length; j++) {
        const bullet = element;
        const chest = chests[j];
        if (
          
          chest.distanceTo(bullet) <= 50
        ) {
          destroyedBullets.push(bullet);
          chest.takeBulletDamage();
          
          break;
        }
      }
    }
    return destroyedBullets;
  }
  module.exports = applychestCollisions;