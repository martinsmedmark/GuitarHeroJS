// constants.js
// Game constants and configuration

// Visual constants
export const VISUAL = {
  NOTE_RADIUS: 0.45,
  HIT_MARKER_RADIUS: 0.55,
  LANE_WIDTH: 1.1,
  LANE_SPACING: 0.2,
  TOTAL_WIDTH: (1.1 + 0.2) * 5 - 0.2, // Calculated from LANE_WIDTH and LANE_SPACING
  HIT_POSITION: 10,
  NUM_FRETS: 7,
  FRET_COLOR: 0xc0c0c0,
  FRET_THICKNESS: 0.05,
  FRETBOARD_LENGTH: 45,
};

// Game timing
export const TIMING = {
  GAME_START_BUFFER_TIME: 3000, // 3 seconds buffer before notes start spawning
  RAPID_NOTE_DELAY: 100, // 100ms between rapid notes
  BEAT_INDICATOR_DURATION: 100, // Visual beat indicator duration
};

// Note colors for each key
export const NOTE_COLORS = {
  A: 0x00ff00, // Green
  S: 0xff0000, // Red
  D: 0xffff00, // Yellow
  F: 0x0000ff, // Blue
  G: 0xffa500, // Orange
};

// Key positions on the fretboard
export const KEY_POSITIONS = {
  A: -VISUAL.TOTAL_WIDTH / 2 + VISUAL.LANE_WIDTH / 2,
  S: -VISUAL.TOTAL_WIDTH / 2 + VISUAL.LANE_WIDTH * 1.5 + VISUAL.LANE_SPACING,
  D: 0,
  F: VISUAL.TOTAL_WIDTH / 2 - VISUAL.LANE_WIDTH * 1.5 - VISUAL.LANE_SPACING,
  G: VISUAL.TOTAL_WIDTH / 2 - VISUAL.LANE_WIDTH / 2,
};

// Available songs
export const SONGS = [
  { name: "tarzan.mp3", bpm: 130, displayName: "Tarzan" },
  { name: "if-you.mp3", bpm: 115, displayName: "If You" },
];

// Difficulty settings
export const DIFFICULTY_SETTINGS = {
  easy: {
    scrollSpeed: 0.05,
    noteSpawnChance: 0.1,
    notesPerBeat: 1,
    chordChance: 0.0,
    rapidChance: 0.0,
    beatSpawnChance: 0.4,
  },
  medium: {
    scrollSpeed: 0.08,
    noteSpawnChance: 0.15,
    notesPerBeat: 2,
    chordChance: 0.1,
    rapidChance: 0.05,
    beatSpawnChance: 0.6,
  },
  hard: {
    scrollSpeed: 0.12,
    noteSpawnChance: 0.2,
    notesPerBeat: 3,
    chordChance: 0.2,
    rapidChance: 0.1,
    beatSpawnChance: 0.8,
  },
};
