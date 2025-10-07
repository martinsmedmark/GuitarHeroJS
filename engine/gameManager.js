// gameManager.js
// Main game logic and coordination

import { gameState } from "./gameState.js";
import { DIFFICULTY_SETTINGS, TIMING } from "./constants.js";
import { audioManager } from "./audio.js";
import { noteManager } from "./notes.js";
import { uiManager } from "./ui.js";
import { sceneManager } from "./scene.js";
import { soundEffectsManager } from "./soundEffects.js";

class GameManager {
  constructor() {
    this.comboCount = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;
    this.setupEventListeners();
  }

  // Initialize game manager
  init() {
    // Game manager is already initialized in constructor
    // This method exists for consistency with other managers
    console.log("GameManager initialized");
  }

  // Get current scroll speed
  get scrollSpeed() {
    return DIFFICULTY_SETTINGS[gameState.difficulty].scrollSpeed;
  }

  // Setup event listeners
  setupEventListeners() {
    document.addEventListener("startGame", () => this.startGame());
    document.addEventListener("pauseGame", () => this.pauseGame());
    document.addEventListener("resumeGame", () => this.resumeGame());
    document.addEventListener("restartGame", () => this.restartGame());
    document.addEventListener("playAgain", () => this.playAgain());
    document.addEventListener("showSongSelection", () =>
      this.showSongSelection()
    );
    document.addEventListener("changeDifficulty", (e) =>
      this.changeDifficulty(e.detail.difficulty)
    );
    document.addEventListener("songSelected", (e) =>
      this.selectSong(e.detail.song)
    );
    document.addEventListener("endGameSongSelected", (e) =>
      this.selectSong(e.detail.song)
    );
    document.addEventListener("keyDown", (e) =>
      this.handleKeyDown(e.detail.key)
    );
    document.addEventListener("keyUp", (e) => this.handleKeyUp(e.detail.key));
    document.addEventListener("volumeChange", (e) =>
      this.changeVolume(e.detail.volume)
    );
  }

  // Game control methods
  async startGame() {
    if (!audioManager.isMusicLoaded) {
      alert(
        "Music is not available. Please check that the audio file exists and refresh the page."
      );
      return;
    }

    gameState.reset();
    gameState.start();

    // Reset combo tracking
    this.comboCount = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;

    noteManager.clearAllNotes();
    uiManager.updateScore();

    audioManager.restartBackgroundMusic();
    uiManager.hidePauseMenu();

    this.updateScrollSpeed();
    uiManager.updateStartButton("Game Running", true);

    // Play song start sound effect
    soundEffectsManager.playSongStart();
  }

  pauseGame() {
    gameState.pause();
    audioManager.pauseBackgroundMusic();
    soundEffectsManager.playGamePause();
    uiManager.showPauseMenu();
  }

  resumeGame() {
    uiManager.hidePauseMenu();
    gameState.start();
    audioManager.resumeBackgroundMusic();
    soundEffectsManager.playGameResume();
    uiManager.updateStartButton("Game Running", true);
  }

  restartGame() {
    uiManager.hidePauseMenu();
    gameState.reset();
    gameState.start();

    // Reset combo tracking
    this.comboCount = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;

    noteManager.clearAllNotes();
    uiManager.updateScore();

    audioManager.restartBackgroundMusic();
    this.updateScrollSpeed();
    uiManager.updateStartButton("Game Running", true);

    // Play song start sound effect
    soundEffectsManager.playSongStart();
  }

  playAgain() {
    uiManager.hideEndGameScreen();
    this.restartGame();
  }

  showSongSelection() {
    uiManager.hideEndGameScreen();
    uiManager.showPauseMenu();
    // Reset game state when selecting new song
    gameState.reset();
    uiManager.updateStartButton("Start", false);
  }

  // Song and difficulty management
  async selectSong(song) {
    const success = await audioManager.loadBackgroundMusic(song);
    soundEffectsManager.playButtonClick();
    if (success) {
      uiManager.updateStartButton("Start", false);
      // Don't hide the menu - let user press Start to begin
    } else {
      uiManager.updateStartButton("Music Unavailable", true);
    }
  }

  changeDifficulty(difficulty) {
    gameState.setDifficulty(difficulty);
    this.updateScrollSpeed();
    soundEffectsManager.playDifficultyChange();
    uiManager.updateDifficultyButtons(difficulty);
    console.log(
      `Difficulty set to: ${difficulty} (Speed: ${this.scrollSpeed})`
    );
  }

  changeVolume(volume) {
    audioManager.setVolume(volume);
  }

  // Game logic
  updateScrollSpeed() {
    // Scroll speed is now calculated dynamically via getter
  }

  detectBeatsAndSpawnNotes() {
    if (!audioManager.isMusicLoaded || !audioManager.isMusicPlaying) {
      return;
    }

    // Check buffer time
    if (!gameState.isBufferTimePassed(TIMING.GAME_START_BUFFER_TIME)) {
      return;
    }

    const isBeat = audioManager.detectBeat();
    if (isBeat) {
      const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
      if (Math.random() < settings.beatSpawnChance) {
        this.spawnNotesOnBeat();
      }
      uiManager.showBeatIndicator();
    }

    // Random note spawning
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    const randomSpawnRate = settings.noteSpawnChance * 0.01;
    if (Math.random() < randomSpawnRate) {
      this.spawnRandomNote();
    }
  }

  spawnNotesOnBeat() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    const pattern = this.determineNotePattern(settings);

    pattern.forEach((noteType) => {
      if (noteType === "single") {
        const randomKey = this.getRandomKey();
        const isLongNote = Math.random() < 0.15;
        noteManager.createNote(randomKey, isLongNote);
      } else if (noteType === "chord") {
        this.spawnChord();
      } else if (noteType === "rapid") {
        this.spawnRapidSequence();
      }
    });
  }

  spawnRandomNote() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    if (Math.random() < settings.noteSpawnChance) {
      const randomKey = this.getRandomKey();
      const isLongNote = Math.random() < 0.1;
      noteManager.createNote(randomKey, isLongNote);
    }
  }

  spawnChord() {
    const keys = Object.keys(noteManager.keyPositions);
    const chordKeys = [];
    const numChordNotes = Math.min(
      2 + Math.floor(Math.random() * 2),
      keys.length
    );

    while (chordKeys.length < numChordNotes) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      if (!chordKeys.includes(randomKey)) {
        chordKeys.push(randomKey);
      }
    }

    chordKeys.forEach((key) => noteManager.createNote(key, false));
  }

  spawnRapidSequence() {
    const rapidKey = this.getRandomKey();
    const rapidCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < rapidCount; i++) {
      setTimeout(
        () => noteManager.createNote(rapidKey, false),
        i * TIMING.RAPID_NOTE_DELAY
      );
    }
  }

  determineNotePattern(settings) {
    const patterns = ["single"];

    if (Math.random() < settings.chordChance) {
      patterns.push("chord");
    }

    if (Math.random() < settings.rapidChance) {
      patterns.push("rapid");
    }

    return patterns.slice(0, settings.notesPerBeat);
  }

  getRandomKey() {
    const keys = Object.keys(noteManager.keyPositions);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  // Input handling
  handleKeyDown(key) {
    if (noteManager.noteColors.hasOwnProperty(key)) {
      gameState.activeKeys[key] = true;
      sceneManager.updateHitMarker(key, true);
      noteManager.handleKeyPress(key);
    }
  }

  handleKeyUp(key) {
    if (noteManager.noteColors.hasOwnProperty(key)) {
      gameState.activeKeys[key] = false;
      sceneManager.updateHitMarker(key, false);
    }
  }

  // Game loop
  update() {
    if (gameState.isPlaying) {
      noteManager.updateNotes(this.scrollSpeed);
      this.detectBeatsAndSpawnNotes();
      noteManager.handleLongNotes();
      this.checkSongEnd();
    }
  }

  checkSongEnd() {
    if (audioManager.backgroundMusic && audioManager.backgroundMusic.ended) {
      console.log("Song has ended, showing end screen");
      soundEffectsManager.playSongEnd();
      gameState.pause();
      uiManager.showEndGameScreen();
    }
  }
}

// Export singleton instance
export const gameManager = new GameManager();
