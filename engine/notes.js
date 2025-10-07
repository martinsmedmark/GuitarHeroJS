// notes.js
// Note creation and management

import * as THREE from "/node_modules/three/build/three.module.js";
import { VISUAL, NOTE_COLORS, KEY_POSITIONS } from "./constants.js";
import { gameState } from "./gameState.js";
import { sceneManager } from "./scene.js";
import { uiManager } from "./ui.js";
import { effectsManager } from "./effects.js";
import { soundEffectsManager } from "./soundEffects.js";
import { gameManager } from "./gameManager.js";

class NoteManager {
  constructor() {
    this.notes = [];
    this.noteColors = NOTE_COLORS;
    this.keyPositions = KEY_POSITIONS;
  }

  // Clear all notes from the scene
  clearAllNotes() {
    this.notes.forEach((note) => {
      sceneManager.getScrollingGroup().remove(note);
    });
    this.notes.length = 0;
  }

  // Create a new note
  createNote(key, isLongNote = false) {
    const noteGroup = new THREE.Group();
    const color = this.noteColors[key];
    const x = this.keyPositions[key];

    // Create note visual
    this.createNoteVisual(noteGroup, color);

    // Set note properties
    const startZ = -VISUAL.FRETBOARD_LENGTH / 2; // Start at the back of the fretboard
    noteGroup.position.set(x, 0.28, startZ);
    noteGroup.userData = {
      key: key,
      isLongNote: isLongNote,
      isBeingHit: false,
      wasHit: false, // Track if note was successfully hit
      longNoteStartTime: isLongNote ? Date.now() : null,
      longNoteDuration: isLongNote ? 1000 : 0, // 1 second for long notes
    };

    sceneManager.getScrollingGroup().add(noteGroup);
    this.notes.push(noteGroup);

    console.log(
      `Created note for key ${key} at position (${x}, 0.28, ${startZ}), hit position: ${
        VISUAL.HIT_POSITION
      }, removal at: ${VISUAL.HIT_POSITION + VISUAL.FRETBOARD_LENGTH / 2}`
    );
  }

  // Create note visual elements
  createNoteVisual(noteGroup, color) {
    // Colored border
    const coloredBorder = new THREE.Mesh(
      new THREE.TorusGeometry(VISUAL.NOTE_RADIUS - 0.05, 0.1, 16, 100),
      new THREE.MeshPhongMaterial({ color: color, shininess: 100 })
    );
    coloredBorder.rotation.x = Math.PI / 2;
    noteGroup.add(coloredBorder);

    // Black inner border
    const blackBorder = new THREE.Mesh(
      new THREE.TorusGeometry(VISUAL.NOTE_RADIUS - 0.18, 0.03, 16, 100),
      new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 })
    );
    blackBorder.rotation.x = Math.PI / 2;
    noteGroup.add(blackBorder);

    // White center
    const whiteCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(
        VISUAL.NOTE_RADIUS - 0.21,
        VISUAL.NOTE_RADIUS - 0.21,
        0.05,
        32
      ),
      new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 })
    );
    noteGroup.add(whiteCenter);
  }

  // Update notes positions and states
  updateNotes(scrollSpeed) {
    this.notes.forEach((note, index) => {
      // Move note forward
      note.position.z += scrollSpeed;

      // Debug: Log when note enters hit zone
      if (
        Math.abs(note.position.z - VISUAL.HIT_POSITION) < 3 &&
        !note.userData.hitZoneLogged
      ) {
        note.userData.hitZoneLogged = true;
      }

      // Check if note passed hit zone without being hit
      if (
        note.position.z > VISUAL.HIT_POSITION + 2 &&
        !note.userData.wasHit &&
        !note.userData.missSoundPlayed
      ) {
        // Play miss sound immediately when note passes hit zone
        soundEffectsManager.playNoteMiss();

        // Break combo streak
        if (gameManager.comboCount > 0) {
          soundEffectsManager.playStreakBreak();
          gameManager.comboCount = 0;
        }

        // Mark that miss sound was played to avoid duplicates
        note.userData.missSoundPlayed = true;
      }

      // Handle long notes
      if (note.userData.isLongNote && note.userData.isBeingHit) {
        this.updateLongNote(note);
      }

      // Remove notes that have passed the hit zone
      if (note.position.z > VISUAL.HIT_POSITION + VISUAL.FRETBOARD_LENGTH / 2) {
        sceneManager.getScrollingGroup().remove(note);
        this.notes.splice(index, 1);
      }
    });
  }

  // Update long note during being hit
  updateLongNote(note) {
    const currentTime = Date.now();
    const elapsed = currentTime - note.userData.longNoteStartTime;

    if (elapsed >= note.userData.longNoteDuration) {
      // Long note completed
      note.userData.isBeingHit = false;
      effectsManager.createHitEffect(
        note.position,
        this.noteColors[note.userData.key]
      );
      soundEffectsManager.playNoteHit(true); // Perfect completion

      // Track combo for long note completion
      gameManager.comboCount++;
      gameManager.maxCombo = Math.max(
        gameManager.maxCombo,
        gameManager.comboCount
      );
      gameManager.perfectHits++;

      // Play combo sound effects
      soundEffectsManager.playCombo(gameManager.comboCount);

      note.userData.wasHit = true;
      this.removeNote(note);
      gameState.addScore(50);
      uiManager.updateScore();
    } else {
      // Add points for holding long note
      gameState.addScore(1);
      uiManager.updateScore();
    }
  }

  // Handle key press
  handleKeyPress(key) {
    const hitNote = this.findNoteInHitZone(key);

    if (hitNote) {
      if (hitNote.userData.isLongNote) {
        this.startLongNote(hitNote);
      } else {
        this.hitNote(hitNote);
      }
    }
  }

  // Find note in hit zone
  findNoteInHitZone(key) {
    return this.notes.find(
      (note) =>
        note.userData.key === key &&
        Math.abs(note.position.z - VISUAL.HIT_POSITION) < 2 &&
        !note.userData.isBeingHit
    );
  }

  // Hit a regular note
  hitNote(note) {
    // Create hit effect before removing the note
    effectsManager.createHitEffect(
      note.position,
      this.noteColors[note.userData.key]
    );

    // Play hit sound effect
    const timing = Math.abs(note.position.z - VISUAL.HIT_POSITION);
    const isPerfect = timing < 0.5; // Perfect hit if within 0.5 units
    soundEffectsManager.playNoteHit(isPerfect);

    // Track combo and play combo sounds
    gameManager.comboCount++;
    gameManager.maxCombo = Math.max(
      gameManager.maxCombo,
      gameManager.comboCount
    );
    if (isPerfect) {
      gameManager.perfectHits++;
    }

    // Play combo sound effects
    soundEffectsManager.playCombo(gameManager.comboCount);

    // Mark note as hit
    note.userData.wasHit = true;
    this.removeNote(note);
    gameState.addScore(50);
    uiManager.updateScore();
  }

  // Start hitting a long note
  startLongNote(note) {
    note.userData.isBeingHit = true;
    note.userData.longNoteStartTime = Date.now();
  }

  // Handle long notes that are currently being hit
  handleLongNotes() {
    this.notes.forEach((note) => {
      if (note.userData.isLongNote && note.userData.isBeingHit) {
        const key = note.userData.key;
        if (!gameState.activeKeys[key]) {
          // Key released, end long note
          note.userData.isBeingHit = false;
          this.removeNote(note);
          gameState.addScore(25); // Partial score for long note
          uiManager.updateScore();
        }
      }
    });
  }

  // Remove note from scene and array
  removeNote(note) {
    sceneManager.getScrollingGroup().remove(note);
    const index = this.notes.indexOf(note);
    if (index > -1) {
      this.notes.splice(index, 1);
    }
  }
}

// Export singleton instance
export const noteManager = new NoteManager();
