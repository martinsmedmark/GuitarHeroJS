// ui.js
// UI management and interactions

import { gameState } from "./gameState.js";
import { SONGS } from "./constants.js";
import { soundEffectsManager } from "./soundEffects.js";

class UIManager {
  constructor() {
    this.elements = {
      startBtn: document.getElementById("startBtn"),
      pauseBtn: document.getElementById("pauseBtn"),
      debugBtn: document.getElementById("debugBtn"),
      score: document.getElementById("score"),
      volumeSlider: document.getElementById("volumeSlider"),
      volumeDisplay: document.getElementById("volumeDisplay"),
      beatIndicator: document.getElementById("beatIndicator"),
      pauseMenu: document.getElementById("pauseMenu"),
      endGameScreen: document.getElementById("endGameScreen"),
      resumeBtn: document.getElementById("resumeBtn"),
      restartBtn: document.getElementById("restartBtn"),
      playAgainBtn: document.getElementById("playAgainBtn"),
      newSongBtn: document.getElementById("newSongBtn"),
      songList: document.getElementById("songList"),
      endGameSongList: document.getElementById("endGameSongList"),
      finalScore: document.getElementById("finalScore"),
    };
  }

  // Initialize UI
  init() {
    this.setupEventListeners();
    this.updateScore();
    this.populateSongList();
  }

  // Setup all event listeners
  setupEventListeners() {
    // Main game buttons
    this.elements.startBtn.addEventListener("click", () => this.onStartClick());
    this.elements.pauseBtn.addEventListener("click", () => this.onPauseClick());
    this.elements.debugBtn.addEventListener("click", () => this.onDebugClick());

    // Volume control
    this.elements.volumeSlider.addEventListener("input", (e) =>
      this.onVolumeChange(e)
    );

    // Menu buttons
    this.elements.resumeBtn.addEventListener("click", () =>
      this.onResumeClick()
    );
    this.elements.restartBtn.addEventListener("click", () =>
      this.onRestartClick()
    );
    this.elements.playAgainBtn.addEventListener("click", () =>
      this.onPlayAgainClick()
    );
    this.elements.newSongBtn.addEventListener("click", () =>
      this.onNewSongClick()
    );

    // Difficulty buttons
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.onDifficultyClick(btn.dataset.difficulty)
      );
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  // Event handlers
  onStartClick() {
    soundEffectsManager.playButtonClick();
    this.dispatchEvent("startGame");
  }

  onPauseClick() {
    soundEffectsManager.playButtonClick();
    this.dispatchEvent("pauseGame");
  }

  onDebugClick() {
    soundEffectsManager.playButtonClick();
    gameState.toggleDebug();
    this.elements.debugBtn.textContent = gameState.debugMode
      ? "Debug ON"
      : "Debug";
  }

  onVolumeChange(e) {
    const volume = e.target.value / 100;
    this.elements.volumeDisplay.textContent = `${e.target.value}%`;
    this.dispatchEvent("volumeChange", { volume });
  }

  onResumeClick() {
    soundEffectsManager.playButtonClick();
    this.dispatchEvent("resumeGame");
  }

  onRestartClick() {
    soundEffectsManager.playButtonClick();
    this.dispatchEvent("restartGame");
  }

  onPlayAgainClick() {
    soundEffectsManager.playButtonClick();
    this.dispatchEvent("playAgain");
  }

  onNewSongClick() {
    soundEffectsManager.playButtonClick();
    this.dispatchEvent("showSongSelection");
  }

  onDifficultyClick(difficulty) {
    soundEffectsManager.playButtonClick();
    this.dispatchEvent("changeDifficulty", { difficulty });
  }

  onKeyDown(event) {
    this.dispatchEvent("keyDown", { key: event.key.toUpperCase() });
  }

  onKeyUp(event) {
    this.dispatchEvent("keyUp", { key: event.key.toUpperCase() });
  }

  // Custom event dispatcher
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  // UI Updates
  updateScore() {
    this.elements.score.textContent = `Score: ${gameState.score}`;
  }

  updateStartButton(text, disabled = false) {
    this.elements.startBtn.textContent = text;
    this.elements.startBtn.disabled = disabled;

    // Update pause button state based on game state
    if (gameState.isPlaying) {
      this.elements.pauseBtn.disabled = false;
      this.elements.pauseBtn.textContent = "Pause";
    } else {
      this.elements.pauseBtn.disabled = true;
      this.elements.pauseBtn.textContent = "Pause";
    }
  }

  updateMenuButtons() {
    const hasPlayed = gameState.gameStartTime > 0;
    const isPlaying = gameState.isPlaying;

    if (hasPlayed && !isPlaying) {
      // Game was started but is now paused
      this.elements.resumeBtn.style.display = "inline-block";
      this.elements.restartBtn.textContent = "Restart";
      this.elements.restartBtn.className = "menu-btn restart-mode";
    } else if (hasPlayed && isPlaying) {
      // Game is currently playing (shouldn't see menu, but just in case)
      this.elements.resumeBtn.style.display = "none";
      this.elements.restartBtn.textContent = "Restart";
      this.elements.restartBtn.className = "menu-btn restart-mode";
    } else {
      // Game hasn't been started yet
      this.elements.resumeBtn.style.display = "none";
      this.elements.restartBtn.textContent = "Start";
      this.elements.restartBtn.className = "menu-btn start-mode";
    }
  }

  updateDifficultyButtons(selectedDifficulty) {
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });
    document
      .querySelector(`[data-difficulty="${selectedDifficulty}"]`)
      .classList.add("selected");
  }

  // Menu management
  showPauseMenu() {
    console.log("Showing pause menu and populating song list");
    soundEffectsManager.playMenuOpen();
    this.elements.pauseMenu.style.display = "flex";
    this.populateSongList();
    this.updateMenuButtons();
  }

  hidePauseMenu() {
    soundEffectsManager.playMenuClose();
    this.elements.pauseMenu.style.display = "none";
  }

  showEndGameScreen() {
    soundEffectsManager.playSongComplete();
    this.elements.finalScore.textContent = gameState.score;
    this.populateEndGameSongList();
    this.elements.endGameScreen.style.display = "flex";
  }

  hideEndGameScreen() {
    soundEffectsManager.playMenuClose();
    this.elements.endGameScreen.style.display = "none";
  }

  // Song list population
  populateSongList() {
    this.populateSongListInElement(this.elements.songList, "songSelected");
  }

  populateEndGameSongList() {
    this.populateSongListInElement(
      this.elements.endGameSongList,
      "endGameSongSelected"
    );
  }

  populateSongListInElement(element, eventName) {
    element.innerHTML = "";

    SONGS.forEach((song) => {
      const songItem = document.createElement("div");
      songItem.className = "song-item";
      songItem.innerHTML = `
        <div class="song-name">${song.displayName}</div>
        <div class="song-bpm">${song.bpm} BPM</div>
      `;

      songItem.addEventListener("click", () => {
        // Remove previous selection
        element.querySelectorAll(".song-item").forEach((item) => {
          item.classList.remove("selected");
        });

        // Add selection to clicked item
        songItem.classList.add("selected");

        // Dispatch event
        this.dispatchEvent(eventName, { song });
      });

      element.appendChild(songItem);
    });
  }

  // Beat indicator
  showBeatIndicator() {
    if (this.elements.beatIndicator) {
      this.elements.beatIndicator.classList.add("beat");
      setTimeout(() => {
        this.elements.beatIndicator.classList.remove("beat");
      }, 100);
    }
  }
}

// Export singleton instance
export const uiManager = new UIManager();
