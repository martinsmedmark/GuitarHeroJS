// ui.js - Exactly like taptaptap toolsBox (ES6 compatible)

// Import dependencies
import { gameEngine } from "./gameManager.js";
import {
  playButtonClick,
  playDifficultyChange,
  playSongComplete,
  playMenuOpen,
  playMenuClose,
} from "./audioManager.js";

// General UI functions (ES6 compatible)
var toolsBox = {
  showPage: function (page) {
    page.style.display = "block";
  },
  hidePage: function (page) {
    page.style.display = "none";
  },
  onClickNTouchstart: function (element, fun) {
    // add click and touchstart event listeners
    element.addEventListener("click", fun, false);
    element.addEventListener("touchstart", fun, false);
  },
  toggleAnimation: function (element, animationClass) {
    // add animation class and remove it when it's done
    element.classList.add(animationClass);
    element.addEventListener(
      "animationend",
      function () {
        element.classList.remove(animationClass);
      },
      false
    );
  },
};

// UI Manager (simplified like taptaptap)
var uiManager = {
  init: async function () {
    this.setupEventListeners();
    await this.populateSongList();
    this.initializeDefaultDifficulty();
  },

  setupEventListeners: function () {
    // Start button
    var startBtn = document.getElementById("startBtn");
    if (startBtn) {
      startBtn.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        playButtonClick();
        gameEngine.start();
      };
    }

    // Pause button
    var pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playButtonClick();
        if (gameEngine.isPlaying) {
          gameEngine.pause();
        } else {
          gameEngine.stop();
        }
      });
    }

    // Resume button
    var resumeBtn = document.getElementById("resumeBtn");
    if (resumeBtn) {
      toolsBox.onClickNTouchstart(resumeBtn, function () {
        playButtonClick();
        gameEngine.resume();
      });
    }

    // Restart button (Start button in pause menu)
    var restartBtn = document.getElementById("restartBtn");
    if (restartBtn) {
      toolsBox.onClickNTouchstart(restartBtn, function () {
        playButtonClick();
        gameEngine.start();
      });
    }

    // Play again button
    var playAgainBtn = document.getElementById("playAgainBtn");
    if (playAgainBtn) {
      toolsBox.onClickNTouchstart(playAgainBtn, function () {
        playButtonClick();
        gameEngine.start();
      });
    }

    // New song button
    var newSongBtn = document.getElementById("newSongBtn");
    if (newSongBtn) {
      toolsBox.onClickNTouchstart(newSongBtn, function () {
        playButtonClick();
        gameEngine.stop();
      });
    }

    // Volume slider
    var volumeSlider = document.getElementById("volumeSlider");
    if (volumeSlider) {
      volumeSlider.addEventListener("input", function (e) {
        var volume = e.target.value / 100;
        document.getElementById("volumeDisplay").innerHTML =
          e.target.value + "%";
        // Volume control would go here if needed
      });
    }

    // Difficulty buttons
    var difficultyBtns = document.querySelectorAll(".difficulty-btn");
    difficultyBtns.forEach(function (button) {
      toolsBox.onClickNTouchstart(button, function () {
        playButtonClick();
        var difficulty = button.dataset.difficulty;

        // Store the selected difficulty in gameEngine
        gameEngine.selectDifficulty(difficulty);

        // Play difficulty change sound
        playDifficultyChange();

        // Remove selected class from all difficulty buttons
        difficultyBtns.forEach(function (btn) {
          btn.classList.remove("selected");
        });

        // Add selected class to clicked button
        button.classList.add("selected");
      });
    });
  },

  updateScore: function () {
    document.getElementById("score").innerHTML = "Score: " + gameEngine.score;
  },

  showPauseMenu: function () {
    var pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.classList.add("show");
      playMenuOpen();
    }
  },

  hidePauseMenu: function () {
    var pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.classList.remove("show");
      playMenuClose();
    }
  },

  showEndGameScreen: function () {
    var endGameScreen = document.getElementById("endGameScreen");
    if (endGameScreen) {
      endGameScreen.classList.remove("hide");
      document.getElementById("finalScore").innerHTML = gameEngine.score;
      playSongComplete();
    }
  },

  hideEndGameScreen: function () {
    var endGameScreen = document.getElementById("endGameScreen");
    if (endGameScreen) {
      endGameScreen.classList.add("hide");
      playMenuClose();
    }
  },

  populateSongList: async function () {
    // Initialize songs from XML first
    await gameEngine.initializeSongs();

    var songList = document.getElementById("songList");
    if (songList) {
      songList.innerHTML = ""; // Clear existing list

      gameEngine.songs.forEach(function (song) {
        var songItem = document.createElement("div");
        songItem.classList.add("song-item");
        songItem.textContent = song.displayName;
        songItem.addEventListener("click", function () {
          playButtonClick();
          gameEngine.selectSong(song);

          // Remove selected class from all song items
          var allSongItems = document.querySelectorAll(".song-item");
          allSongItems.forEach(function (item) {
            item.classList.remove("selected");
          });

          // Add selected class to clicked song item
          songItem.classList.add("selected");

          // Update start button text
          document.getElementById("startBtn").innerHTML = "Start";
          document.getElementById("startBtn").disabled = false;
        });
        songList.appendChild(songItem);
      });

      // Select the first song by default
      if (gameEngine.songs.length > 0) {
        var firstSongItem = songList.querySelector(".song-item");
        if (firstSongItem) {
          firstSongItem.classList.add("selected");
        }
      }
    }
  },

  initializeDefaultDifficulty: function () {
    // Set the default difficulty in gameEngine to match the UI
    gameEngine.selectDifficulty("medium");
  },
};

// Export for use in other modules
export { uiManager, toolsBox };
