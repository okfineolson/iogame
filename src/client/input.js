// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection , updatebulletDirection } from './networking';

function onMouseInput(e) {
  handleInput(e.clientX, e.clientY);
}
function onkeybordInput(e){
  switch (e.key) {
    case "w":
    handleInputkey(0,0);
        break;
    case "a":
    handleInputkey(-1,0);
        break;
    case "d":
    handleInputkey(1,0);
        break;
    case "s":
    handleInputkey(0,-1);
        break;
    
  }
}
function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
}

function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  updatebulletDirection(dir);
  //alert(dir)
}
function handleInputkey(x,y) {
  const dir = Math.atan2(x,y);
  updateDirection(dir);
}
export function startCapturingInput() {
  //window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onMouseInput);
  window.addEventListener('keydown', onkeybordInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
}

export function stopCapturingInput() {
  //window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onMouseInput);
  window.removeEventListener('keydown', onkeybordInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
}
