// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
import { connect, play } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';

// I'm using a tiny subset of Bootstrap here for convenience - there's some wasted CSS,
// but not much. In general, you should be careful using Bootstrap because it makes it
// easy to unnecessarily bloat your site.
import './css/bootstrap-reboot.css';
import './css/main.css';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');
const tutButton = document.getElementById('tutorial-button');
const tut = document.getElementById('tut');
const close = document.getElementById('close-tutorial-button');
const next1 = document.getElementById('next1');
const tut1 = document.getElementById('tut1');
Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  usernameInput.focus();
  playButton.onclick = () => {
    // Play!
    play(usernameInput.value);
    playMenu.classList.add('hidden');
    initState();
    startCapturingInput();
    startRendering();
    setLeaderboardHidden(false);
  };
  tutButton.onclick = () => {
    tut.classList.remove('hidden');
    close.classList.remove('hidden');
    playMenu.classList.add('hidden');
    next1.classList.remove('hidden')
  }
  close.onclick = () => {
    tut.classList.add('hidden');
    tut1.classList.add('hidden');
    playMenu.classList.remove('hidden');
  }
  next1.onclick = () => {
    tut.classList.add('hidden');
    tut1.classList.remove('hidden');
    close.classList.remove('hidden');
  }
}).catch(console.error);

function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
}
