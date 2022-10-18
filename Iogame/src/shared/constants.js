module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  CHEST_MAX_HP: 200,
  PLAYER_SPEED: 250,
  CHEST_OPENSTATE: 0,
  PLAYER_FIRE_COOLDOWN: 0.25,

  BULLET_RADIUS: 4,
  BULLET_SPEED: 700,
  BULLET_DAMAGE: 10,

  SCORE_BULLET_HIT: 5,
  SCORE_PER_SECOND: 1,

  MAP_SIZE: 3000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    stInput: 'stInput',
    GAME_OVER: 'dead',
  },
});
