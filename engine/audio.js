// audio.js
// Audio management for background music and sound effects

// Song configuration
const songs = [{ name: "tarzan.mp3", bpm: 130, displayName: "Tarzan" }];

class AudioManager {
  constructor() {
    this.backgroundMusic = null;
    this.isMusicLoaded = false;
    this.isMusicPlaying = false;
    this.volume = 0.5;
    this.currentSong = null;
    this.currentBPM = 130;
    this.beatDetection = {
      lastBeatTime: 0,
      isBeat: false,
    };
  }

  // Initialize audio system and load default song
  async initAudio() {
    // Load the first song as default
    if (songs.length > 0) {
      return await this.loadBackgroundMusic(songs[0]);
    }
    return false;
  }

  // Load background music from song object
  async loadBackgroundMusic(song) {
    return new Promise((resolve) => {
      this.currentSong = song;
      this.currentBPM = song.bpm;

      this.backgroundMusic = new Audio(`public/audio/${song.name}`);
      this.backgroundMusic.loop = false; // Don't loop - let song end naturally
      this.backgroundMusic.volume = this.volume;

      this.backgroundMusic.addEventListener("canplaythrough", () => {
        this.isMusicLoaded = true;
        console.log(`Loaded: ${song.displayName} (${song.bpm} BPM)`);
        resolve(true);
      });

      this.backgroundMusic.addEventListener("error", (e) => {
        console.error(`Failed to load music: ${song.name}`, e);
        console.error(`Attempted path: public/audio/${song.name}`);
        resolve(false);
      });

      setTimeout(() => resolve(false), 5000);
      this.backgroundMusic.load();
    });
  }

  // Play background music
  playBackgroundMusic() {
    if (!this.isMusicLoaded || this.isMusicPlaying) return;

    this.backgroundMusic.play();
    this.isMusicPlaying = true;
  }

  // Pause background music
  pauseBackgroundMusic() {
    if (!this.isMusicLoaded || !this.isMusicPlaying) return;

    this.backgroundMusic.pause();
    this.isMusicPlaying = false;
  }

  // Resume background music
  resumeBackgroundMusic() {
    if (!this.isMusicLoaded || this.isMusicPlaying) return;

    this.backgroundMusic.play();
    this.isMusicPlaying = true;
  }

  // Restart background music from beginning
  restartBackgroundMusic() {
    if (!this.isMusicLoaded) return;

    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic.play();
    this.isMusicPlaying = true;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }

    if (this.backgroundMusic && !this.backgroundMusic.isWebAudio) {
      this.backgroundMusic.volume = this.volume;
    }
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Stop background music completely
  stopBackgroundMusic() {
    this.pauseBackgroundMusic();
    if (this.backgroundMusic && !this.backgroundMusic.isWebAudio) {
      this.backgroundMusic.currentTime = 0;
    }
  }

  // Resume audio context (required for some browsers)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  // Detect beats using current song's BPM
  detectBeat() {
    if (!this.backgroundMusic || !this.isMusicPlaying) {
      return false;
    }

    const currentTime = Date.now();
    const timeSinceLastBeat = currentTime - this.beatDetection.lastBeatTime;

    // Calculate beat interval from current song's BPM
    const beatInterval = (60 / this.currentBPM) * 1000; // Convert BPM to milliseconds

    // Add some natural variation (±5% of beat interval)
    const variation = (Math.random() - 0.5) * beatInterval * 0.1;
    const adjustedInterval = beatInterval + variation;

    if (timeSinceLastBeat > adjustedInterval) {
      this.beatDetection.lastBeatTime = currentTime;
      this.beatDetection.isBeat = true;
      return true;
    }

    this.beatDetection.isBeat = false;
    return false;
  }

  // Get current beat status
  isBeat() {
    return this.beatDetection ? this.beatDetection.isBeat : false;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
