// gameState.js
// Game state management

class GameState {
  constructor() {
    this.score = 0;
    this.isPlaying = false;
    this.debugMode = false;
    this.difficulty = "medium";
    this.gameStartTime = 0;
    this.activeKeys = {};
  }

  // Reset game state
  reset() {
    this.score = 0;
    this.isPlaying = false;
    this.gameStartTime = 0;
    this.activeKeys = {};
  }

  // Start game
  start() {
    this.isPlaying = true;
    this.gameStartTime = Date.now();
  }

  // Pause game
  pause() {
    this.isPlaying = false;
  }

  // Add score
  addScore(points) {
    this.score += points;
  }

  // Set difficulty
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  // Check if buffer time has passed
  isBufferTimePassed(bufferTime) {
    const currentTime = Date.now();
    const timeSinceStart = currentTime - this.gameStartTime;
    return timeSinceStart >= bufferTime;
  }

  // Toggle debug mode
  toggleDebug() {
    this.debugMode = !this.debugMode;
  }
}

// Create singleton instance
export const gameState = new GameState();
