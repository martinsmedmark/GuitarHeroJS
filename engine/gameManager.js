// gameManager.js - Exactly like taptaptap gameEngine (ES6 compatible)

// Import audio functions
import {
  startMusic,
  stopMusic,
  pauseMusic,
  resumeMusic,
  playCombo,
  playStreakBreak,
  playSongEnd,
  playGamePause,
  playGameResume,
  playSongComplete,
} from "./audioManager.js";
import { DIFFICULTY_SETTINGS } from "./constants.js";
import { notesEngine } from "./notes.js";
import { parseMusicXML } from "./audioManager.js";

// Game Engine Object (ES6 compatible)
var gameEngine = {
  // Current game settings
  levelNum: 1,
  score: 0,
  comboCount: 0,
  maxCombo: 0,
  perfectHits: 0,
  isPlaying: false,
  selectedSong: null, // Will be set from XML
  selectedDifficulty: "medium", // Default difficulty
  songs: [], // Will be populated from XML

  updateScore: function (amount) {
    gameEngine.score = amount;
    document.getElementById("score").innerHTML = "Score: " + gameEngine.score;
  },

  updateLevel: function (levelNum) {
    gameEngine.levelNum = levelNum;
  },

  reset: function () {
    gameEngine.score = 0;
    gameEngine.comboCount = 0;
    gameEngine.maxCombo = 0;
    gameEngine.perfectHits = 0;
    gameEngine.isPlaying = false;
    gameEngine.updateScore(0);
  },

  selectSong: function (song) {
    gameEngine.selectedSong = song;
  },

  selectDifficulty: function (difficulty) {
    gameEngine.selectedDifficulty = difficulty;
  },

  getCurrentDifficultySettings: function () {
    return DIFFICULTY_SETTINGS[gameEngine.selectedDifficulty];
  },

  initializeSongs: async function () {
    try {
      gameEngine.songs = await parseMusicXML();
      if (gameEngine.songs.length > 0) {
        gameEngine.selectedSong = gameEngine.songs[0]; // Set first song as default
      }
    } catch (error) {
      console.warn("Failed to initialize songs from XML:", error);
      gameEngine.songs = [];
    }
  },

  start: function () {
    try {
      gameEngine.reset();
      gameEngine.isPlaying = true;

      // Clear notes
      notesEngine.clearAll();

      // Start music
      startMusic();

      // Update UI
      document.getElementById("startBtn").innerHTML = "Game Running";
      document.getElementById("startBtn").disabled = true;
      document.getElementById("pauseBtn").disabled = false;
      document.getElementById("pauseBtn").innerHTML = "Pause";

      // Hide pause menu
      var pauseMenu = document.getElementById("pauseMenu");
      if (pauseMenu) {
        pauseMenu.classList.remove("show");
      }
    } catch (error) {
      console.error("Error in gameEngine.start():", error);
    }
  },

  pause: function () {
    gameEngine.isPlaying = false;
    playGamePause();
    pauseMusic();

    // Show pause menu
    var pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.classList.add("show");
    }
  },

  resume: function () {
    gameEngine.isPlaying = true;
    playGameResume();
    resumeMusic();

    // Hide pause menu
    var pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.classList.remove("show");
    }
  },

  stop: function () {
    gameEngine.isPlaying = false;
    playSongEnd();
    stopMusic();

    // Reset UI
    document.getElementById("startBtn").innerHTML = "Start";
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").innerHTML = "Menu";

    // Show pause menu
    var pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.classList.add("show");
    }
  },

  goodNoteHit: function () {
    gameEngine.comboCount++;
    if (gameEngine.comboCount > gameEngine.maxCombo) {
      gameEngine.maxCombo = gameEngine.comboCount;
    }
    gameEngine.perfectHits++;
    gameEngine.updateScore(gameEngine.score + 100);

    // Play combo sound for good hits
    if (gameEngine.comboCount > 1) {
      playCombo(gameEngine.comboCount);
    }
  },

  badNoteHit: function () {
    gameEngine.comboCount = 0;
    gameEngine.updateScore(gameEngine.score + 50);
  },

  missNote: function () {
    if (gameEngine.comboCount > 0) {
      playStreakBreak();
    }
    gameEngine.comboCount = 0;
  },
};

// Export for use in other modules
export { gameEngine };
