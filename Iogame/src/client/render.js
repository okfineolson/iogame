// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, PLAYER_MAX_HP, BULLET_RADIUS, MAP_SIZE, CHEST_MAX_HP} = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
//canvas.style.backgroundImage  =  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23232122' stroke-width='2.4'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23959397'%3E%3Ccircle cx='769' cy='229' r='5'/%3E%3Ccircle cx='539' cy='269' r='5'/%3E%3Ccircle cx='603' cy='493' r='5'/%3E%3Ccircle cx='731' cy='737' r='5'/%3E%3Ccircle cx='520' cy='660' r='5'/%3E%3Ccircle cx='309' cy='538' r='5'/%3E%3Ccircle cx='295' cy='764' r='5'/%3E%3Ccircle cx='40' cy='599' r='5'/%3E%3Ccircle cx='102' cy='382' r='5'/%3E%3Ccircle cx='127' cy='80' r='5'/%3E%3Ccircle cx='370' cy='105' r='5'/%3E%3Ccircle cx='578' cy='42' r='5'/%3E%3Ccircle cx='237' cy='261' r='5'/%3E%3Ccircle cx='390' cy='382' r='5'/%3E%3C/g%3E%3C/svg%3E");
const context = canvas.getContext('2d');
setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));

let animationFrameRequestId;

function render() {
  const { me, others, bullets,chest,obstacle } = getCurrentState();//,chest
  if (me) {
    // Draw background
    renderBackground(me.x, me.y);

    // Draw boundaries
    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_SIZE, MAP_SIZE);
    // Draw all bullets
    bullets.forEach(renderBullet.bind(null, me));
    
    // Draw all chest
    chest.forEach(renderchest.bind(null, me));
    //obstacle.forEach(renderobstacle.bind(null, me));
    // Draw all players
    renderPlayer(me, me);
    others.forEach(renderOther.bind(null, me));
  }

  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(render);
}

function renderchest(me ,chest) {
  const { x, y} = chest;
  //draw chest

  if(chest.checkopen != 0){
    //alert(chest.checkopen)
    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.strokeRect(canvas.width / 2 + x - me.x-100, canvas.height / 2 + y - me.y-50, 300, 300);
  }


  context.drawImage(
    getAsset('planet.svg'),
    canvas.width / 2 + x - me.x ,
    canvas.height / 2 + y - me.y ,
    100,
    100,
  );
  context.strokeStyle = 'white';
  context.lineWidth = 1;
 
  //draw console

  context.strokeRect(canvas.width / 2 + x - me.x, canvas.height / 2 + y - me.y+150, 100,50);
  
  
  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(
    canvas.width / 2 + x - me.x ,
    canvas.height / 2 + y - me.y   - 20,
    100,
    2,
  );
  context.fillStyle = 'red';
  context.fillRect(
    x + (canvas.width / 2  - me.x) ,
    canvas.height / 2 + y - me.y   - 20,
    100 *  (1 - ((chest.hp) / CHEST_MAX_HP)),
    2,
    );
}

function renderBackground(x, y) {
  const backgroundX = MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE / 2 - y + canvas.height / 2;
  const backgroundGradient = context.createRadialGradient(
    backgroundX,
    backgroundY,
    MAP_SIZE / 10,
    backgroundX,
    backgroundY,
    MAP_SIZE / 2,
  );
  //backgroundGradient.addColorStop(0, 'black');
  context.drawImage(
    getAsset('background.svg'),
    0-x, 
    0-y,
    MAP_SIZE*1.5,
    MAP_SIZE*1.5,
  );
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

// Renders a ship at the given coordinates
function renderOther(me, player) {
  const { x, y, direction, bltdirection } = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(bltdirection);
  context.drawImage(
    getAsset('spaceship1.svg'),
    -PLAYER_RADIUS,
    -PLAYER_RADIUS,
    PLAYER_RADIUS * 2,
    PLAYER_RADIUS * 2,
  );
  
  context.restore();
  context.fillStyle = 'white';
  context.textAlign = 'center'
  //alert(player.username)
  context.fillText(player.username.slice(0,-3),canvasX,canvasY-25);
  let text = "off"
  if(player.cooperationState == 0){
    text = "on"
  }
  

  if(player.insamechest == "nothingNaN" ){
    text = "not in console"
  }else{
    text = "in console"
  }
  context.fillText(text,canvasX,canvasY-35);
  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(
    canvasX - PLAYER_RADIUS,
    canvasY + PLAYER_RADIUS + 8,
    PLAYER_RADIUS * 2,
    2,
  );
  context.fillStyle = 'red';
  context.fillRect(
    canvasX - PLAYER_RADIUS + PLAYER_RADIUS * 2 * player.hp / PLAYER_MAX_HP,
    canvasY + PLAYER_RADIUS + 8,
    PLAYER_RADIUS * 2 * (1 - player.hp / PLAYER_MAX_HP),
    2,
  );
  

}
function renderPlayer(me, player) {
  const { x, y, direction, bltdirection } = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(bltdirection);
  context.drawImage(
    getAsset('spaceship1.svg'),
    -PLAYER_RADIUS,
    -PLAYER_RADIUS,
    PLAYER_RADIUS * 2,
    PLAYER_RADIUS * 2,
  );
  
  context.restore();
  context.fillStyle = 'white';
  context.textAlign = 'center'
  //alert(player.username)
  context.fillText(player.username.slice(0,-3),canvasX,canvasY-25);
  let text = "off"
  if(player.cooperationState == 0){
    text = "on"
  }
  //if(meorother == 0){}
  context.fillText(text,canvasX,canvasY-45);

  if(player.inconsolestate == 0 ){
    text = "not in console"
  }else{
    text = "in console"
  }
  context.fillText(text,canvasX,canvasY-35);
  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(
    canvasX - PLAYER_RADIUS,
    canvasY + PLAYER_RADIUS + 8,
    PLAYER_RADIUS * 2,
    2,
  );
  context.fillStyle = 'red';
  context.fillRect(
    canvasX - PLAYER_RADIUS + PLAYER_RADIUS * 2 * player.hp / PLAYER_MAX_HP,
    canvasY + PLAYER_RADIUS + 8,
    PLAYER_RADIUS * 2 * (1 - player.hp / PLAYER_MAX_HP),
    2,
  );
  

}

function renderBullet(me, bullet) {
  const { x, y ,bltdirection} = bullet;
  context.rotate(bltdirection);

  context.drawImage(
    getAsset('bullet1.svg'),
    canvas.width / 2 + x - me.x - BULLET_RADIUS,
    canvas.height / 2 + y - me.y - BULLET_RADIUS,
    BULLET_RADIUS * 2 +10,
    BULLET_RADIUS * 2 +10,
  );
}

function renderMainMenu() {
  const t = Date.now() / 7500;
  const x = MAP_SIZE / 2 + 800 * Math.cos(t);
  const y = MAP_SIZE / 2 + 800 * Math.sin(t);
  renderBackground(x, y);

  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}

animationFrameRequestId = requestAnimationFrame(renderMainMenu);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(render);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}
