// soundEffects.js
// Sound effects management for all game events

import * as THREE from "/node_modules/three/build/three.module.js";

class SoundEffectsManager {
  constructor() {
    this.sounds = {};
    this.volume = 0.7; // Default volume for sound effects
    this.masterVolume = 1.0; // Master volume control
    this.isEnabled = true;

    // Sound effect definitions
    this.soundDefinitions = {
      // UI Sounds
      buttonClick: { file: "ui/button-click.mp3", volume: 0.6 },
      buttonHover: { file: "ui/button-hover.mp3", volume: 0.4 },
      menuOpen: { file: "ui/menu-open.mp3", volume: 0.5 },
      menuClose: { file: "ui/menu-close.mp3", volume: 0.5 },

      // Game Sounds
      noteHit: { file: "game/note-hit.mp3", volume: 0.8 },
      noteMiss: { file: "game/note-miss.mp3", volume: 0.6 },
      notePerfect: { file: "game/note-perfect.mp3", volume: 0.9 },

      // Song Events
      songStart: { file: "events/song-start.mp3", volume: 0.7 },
      songEnd: { file: "events/song-end.mp3", volume: 0.7 },
      songComplete: { file: "events/song-complete.mp3", volume: 0.8 },

      // Combo and Streak Sounds
      combo2: { file: "game/combo-2.mp3", volume: 0.6 },
      combo3: { file: "game/combo-3.mp3", volume: 0.7 },
      combo5: { file: "game/combo-5.mp3", volume: 0.8 },
      combo10: { file: "game/combo-10.mp3", volume: 0.9 },
      combo20: { file: "game/combo-20.mp3", volume: 1.0 },
      streakBreak: { file: "game/streak-break.mp3", volume: 0.5 },

      // Power-up and Special Effects
      powerUp: { file: "game/power-up.mp3", volume: 0.8 },
      multiplier: { file: "game/multiplier.mp3", volume: 0.7 },
      perfectStreak: { file: "game/perfect-streak.mp3", volume: 0.9 },
      whammy: { file: "game/whammy.mp3", volume: 0.6 },

      // Menu and UI Enhancements
      menuHover: { file: "ui/menu-hover.mp3", volume: 0.3 },
      menuTransition: { file: "ui/menu-transition.mp3", volume: 0.4 },
      difficultyChange: { file: "ui/difficulty-change.mp3", volume: 0.5 },
      scoreUpdate: { file: "ui/score-update.mp3", volume: 0.3 },

      // Game State Sounds
      gamePause: { file: "events/game-pause.mp3", volume: 0.6 },
      gameResume: { file: "events/game-resume.mp3", volume: 0.6 },
      gameOver: { file: "events/game-over.mp3", volume: 0.8 },
      levelUp: { file: "events/level-up.mp3", volume: 0.9 },

      // Menu Music
      menuMusic: { file: "music/menu-ambient.mp3", volume: 0.3, loop: true },
      pauseMusic: { file: "music/pause-ambient.mp3", volume: 0.2, loop: true },
    };

    this.loadSounds();
  }

  // Load all sound effects
  async loadSounds() {
    const loadPromises = Object.entries(this.soundDefinitions).map(
      ([key, definition]) => this.loadSound(key, definition)
    );

    try {
      await Promise.all(loadPromises);
      console.log("All sound effects loaded successfully");
    } catch (error) {
      console.warn("Some sound effects failed to load:", error);
    }
  }

  // Load individual sound
  async loadSound(key, definition) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(`public/audio/sfx/${definition.file}`);
        audio.volume = definition.volume * this.volume * this.masterVolume;
        audio.loop = definition.loop || false;

        audio.addEventListener("canplaythrough", () => {
          this.sounds[key] = audio;
          resolve(true);
        });

        audio.addEventListener("error", (e) => {
          console.warn(`Failed to load sound: ${definition.file}`, e);
          // Create a silent placeholder to prevent errors
          this.sounds[key] = { play: () => {}, pause: () => {}, volume: 0 };
          resolve(false);
        });

        audio.load();
      } catch (error) {
        console.warn(`Error loading sound ${key}:`, error);
        this.sounds[key] = { play: () => {}, pause: () => {}, volume: 0 };
        resolve(false);
      }
    });
  }

  // Play a sound effect
  playSound(soundKey, options = {}) {
    if (!this.isEnabled || !this.sounds[soundKey]) {
      return;
    }

    const sound = this.sounds[soundKey];
    const definition = this.soundDefinitions[soundKey];

    if (!definition) {
      console.warn(`Sound definition not found for: ${soundKey}`);
      return;
    }

    try {
      // Reset audio to beginning if it's already playing
      if (sound.currentTime > 0) {
        sound.currentTime = 0;
      }

      // Apply volume override if provided
      if (options.volume !== undefined) {
        sound.volume = options.volume * this.masterVolume;
      } else {
        sound.volume = definition.volume * this.volume * this.masterVolume;
      }

      sound.play().catch((error) => {
        console.warn(`Failed to play sound ${soundKey}:`, error);
      });
    } catch (error) {
      console.warn(`Error playing sound ${soundKey}:`, error);
    }
  }

  // Stop a sound effect
  stopSound(soundKey) {
    if (this.sounds[soundKey]) {
      try {
        this.sounds[soundKey].pause();
        this.sounds[soundKey].currentTime = 0;
      } catch (error) {
        console.warn(`Error stopping sound ${soundKey}:`, error);
      }
    }
  }

  // Stop all sounds
  stopAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
        // Ignore errors for silent placeholders
      }
    });
  }

  // Set master volume
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  // Set sound effects volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  // Update volumes for all sounds
  updateAllVolumes() {
    Object.entries(this.sounds).forEach(([key, sound]) => {
      const definition = this.soundDefinitions[key];
      if (definition && sound.volume !== undefined) {
        sound.volume = definition.volume * this.volume * this.masterVolume;
      }
    });
  }

  // Enable/disable sound effects
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Get master volume
  getMasterVolume() {
    return this.masterVolume;
  }

  // Check if sound is enabled
  isSoundEnabled() {
    return this.isEnabled;
  }

  // UI Sound Effects
  playButtonClick() {
    this.playSound("buttonClick");
  }

  playButtonHover() {
    this.playSound("buttonHover");
  }

  playMenuOpen() {
    this.playSound("menuOpen");
  }

  playMenuClose() {
    this.playSound("menuClose");
  }

  // Game Sound Effects
  playNoteHit(perfect = false) {
    if (perfect) {
      this.playSound("notePerfect");
    } else {
      this.playSound("noteHit");
    }
  }

  playNoteMiss() {
    this.playSound("noteMiss");
  }

  // Song Event Sounds
  playSongStart() {
    this.playSound("songStart");
  }

  playSongEnd() {
    this.playSound("songEnd");
  }

  playSongComplete() {
    this.playSound("songComplete");
  }

  // Combo and Streak Sounds
  playCombo(comboCount) {
    if (comboCount >= 20) {
      this.playSound("combo20");
    } else if (comboCount >= 10) {
      this.playSound("combo10");
    } else if (comboCount >= 5) {
      this.playSound("combo5");
    } else if (comboCount >= 3) {
      this.playSound("combo3");
    } else if (comboCount >= 2) {
      this.playSound("combo2");
    }
  }

  playStreakBreak() {
    this.playSound("streakBreak");
  }

  // Power-up and Special Effects
  playPowerUp() {
    this.playSound("powerUp");
  }

  playMultiplier() {
    this.playSound("multiplier");
  }

  playPerfectStreak() {
    this.playSound("perfectStreak");
  }

  playWhammy() {
    this.playSound("whammy");
  }

  // Menu and UI Enhancements
  playMenuHover() {
    this.playSound("menuHover");
  }

  playMenuTransition() {
    this.playSound("menuTransition");
  }

  playDifficultyChange() {
    this.playSound("difficultyChange");
  }

  playScoreUpdate() {
    this.playSound("scoreUpdate");
  }

  // Game State Sounds
  playGamePause() {
    this.playSound("gamePause");
  }

  playGameResume() {
    this.playSound("gameResume");
  }

  playGameOver() {
    this.playSound("gameOver");
  }

  playLevelUp() {
    this.playSound("levelUp");
  }

  // Menu Music
  playMenuMusic() {
    this.playSound("menuMusic");
  }

  playPauseMusic() {
    this.playSound("pauseMusic");
  }

  stopMenuMusic() {
    this.stopSound("menuMusic");
  }

  stopPauseMusic() {
    this.stopSound("pauseMusic");
  }
}

// Export singleton instance
export const soundEffectsManager = new SoundEffectsManager();
