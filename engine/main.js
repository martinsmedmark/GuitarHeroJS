// main.js - Simplified like taptaptap (ES6 compatible)

import { sceneManager } from "./scene.js";
import { uiManager } from "./ui.js";
import { gameEngine } from "./gameManager.js";
import { notesEngine } from "./notes.js";
import { effectsManager } from "./effects.js";

// Make gameEngine globally accessible for audioManager
window.gameEngine = gameEngine;

// Initialize the game
function init() {
  // Initialize scene
  sceneManager.init();
  sceneManager.setupEventListeners();
  sceneManager.createFretboard();
  sceneManager.createLanes();
  sceneManager.createHitMarkers();
  sceneManager.createFrets();

  // Initialize notes engine with scene
  notesEngine.init(sceneManager.scene);

  // Initialize UI
  uiManager.init();

  // Start the game loop
  animate();
}

// Main game loop (simplified like taptaptap)
function animate() {
  requestAnimationFrame(animate);

  if (gameEngine.isPlaying) {
    // Update notes
    notesEngine.update();

    // Spawn new notes based on difficulty settings
    var difficultySettings = gameEngine.getCurrentDifficultySettings();
    if (Math.random() < difficultySettings.noteSpawnChance / 100) {
      // Spawn multiple notes per beat based on difficulty
      for (var i = 0; i < difficultySettings.notesPerBeat; i++) {
        notesEngine.spawnNote();
      }
    }
  }

  // Update particle effects (always running)
  effectsManager.updateParticles();

  // Always render the scene (this is essential for Three.js)
  sceneManager.render();
}

// Keyboard input handling
document.addEventListener("keydown", function (event) {
  var key = event.key.toUpperCase();
  var validKeys = ["A", "S", "D", "F", "G"];

  if (validKeys.includes(key)) {
    sceneManager.updateHitMarker(key, true);
    notesEngine.hitNote(key);
  }
});

// Reset hitmarker when key is released
document.addEventListener("keyup", function (event) {
  var key = event.key.toUpperCase();
  var validKeys = ["A", "S", "D", "F", "G"];

  if (validKeys.includes(key)) {
    sceneManager.updateHitMarker(key, false);
  }
});

function resumeAudioContext() {
  const audioContext = window.waxml && window.waxml._ctx;
  if (audioContext) {
    if (audioContext.state === "suspended") {
      audioContext
        .resume()
        .then(() => {})
        .catch((error) => {
          console.warn("Failed to resume AudioContext on user gesture:", error);
        });
    }
  }
}

// Add click event listener to resume AudioContext on any user interaction
document.addEventListener("click", resumeAudioContext, { once: true });
document.addEventListener("keydown", resumeAudioContext, { once: true });

// Start the game when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
