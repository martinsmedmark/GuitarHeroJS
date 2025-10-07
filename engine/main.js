// main.js
// Main game initialization and loop

import { sceneManager } from "./scene.js";
import { uiManager } from "./ui.js";
import { audioManager } from "./audio.js";
import { gameManager } from "./gameManager.js";
import { effectsManager } from "./effects.js";
import { noteManager } from "./notes.js";
import { gameState } from "./gameState.js";

// Initialize the game
async function init() {
  // Initialize scene
  sceneManager.init();
  sceneManager.setupEventListeners();
  sceneManager.createFretboard();
  sceneManager.createLanes();
  sceneManager.createHitMarkers();
  sceneManager.createFrets();

  // Initialize UI and audio
  uiManager.init();
  await audioManager.initAudio(); // Load default song and show pause menu
  gameManager.init(); // Setup game logic and event listeners

  // Start the game loop
  animate();
}

// Main game loop
function animate() {
  requestAnimationFrame(animate);

  if (gameState.isPlaying) {
    noteManager.updateNotes(gameManager.scrollSpeed);
    effectsManager.updateFrets(gameManager.scrollSpeed);
    gameManager.detectBeatsAndSpawnNotes();
    effectsManager.updateParticles();
    noteManager.handleLongNotes();

    // Check if song has ended
    gameManager.checkSongEnd();
  }

  sceneManager.render();
}

// Start the game when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
