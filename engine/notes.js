// notes.js - Three.js compatible notes engine

// Import dependencies
import { gameEngine } from "./gameManager.js";
import { playNoteMiss, playNoteHit } from "./audioManager.js";
import * as THREE from "three";
import { NOTE_COLORS, KEY_POSITIONS, VISUAL } from "./constants.js";
import { effectsManager } from "./effects.js";
import { sceneManager } from "./scene.js";

// Notes Engine (Three.js compatible)
var notesEngine = {
  notes: [],
  scene: null,

  init: function (scene) {
    this.scene = scene;
  },

  create: function (key) {
    // Create note group (like original)
    var noteGroup = new THREE.Group();
    var color = NOTE_COLORS[key];
    var x = KEY_POSITIONS[key];

    // Create note visual (exactly like original)
    this.createNoteVisual(noteGroup, color);

    // Set note properties
    var startZ = -VISUAL.FRETBOARD_LENGTH / 2; // Start at the back of the fretboard
    noteGroup.position.set(x, 0.28, startZ);
    noteGroup.userData = {
      key: key,
      isLongNote: false,
      isBeingHit: false,
      wasHit: false,
      longNoteStartTime: null,
      longNoteDuration: 0,
    };

    // Add to scene
    if (this.scene) {
      this.scene.add(noteGroup);
    }

    return noteGroup;
  },

  // Create note visual elements (exactly like original)
  createNoteVisual: function (noteGroup, color) {
    // Colored border
    var coloredBorder = new THREE.Mesh(
      new THREE.TorusGeometry(VISUAL.NOTE_RADIUS - 0.05, 0.1, 16, 100),
      new THREE.MeshPhongMaterial({ color: color, shininess: 100 })
    );
    coloredBorder.rotation.x = Math.PI / 2;
    noteGroup.add(coloredBorder);

    // Black inner border
    var blackBorder = new THREE.Mesh(
      new THREE.TorusGeometry(VISUAL.NOTE_RADIUS - 0.18, 0.03, 16, 100),
      new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 })
    );
    blackBorder.rotation.x = Math.PI / 2;
    noteGroup.add(blackBorder);

    // White center
    var whiteCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(
        VISUAL.NOTE_RADIUS - 0.21,
        VISUAL.NOTE_RADIUS - 0.21,
        0.05,
        32
      ),
      new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 })
    );
    noteGroup.add(whiteCenter);
  },

  destroy: function (note) {
    if (note && this.scene) {
      // Dispose of all child meshes in the group
      note.traverse(function (child) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          child.material.dispose();
        }
      });

      this.scene.remove(note);
    }
  },

  add: function (key) {
    var note = notesEngine.create(key);
    notesEngine.notes.push(note);
    return note;
  },

  remove: function (note) {
    var index = notesEngine.notes.indexOf(note);
    if (index > -1) {
      notesEngine.notes.splice(index, 1);
    }
    notesEngine.destroy(note);
  },

  clearAll: function () {
    for (var i = notesEngine.notes.length - 1; i >= 0; i--) {
      notesEngine.destroy(notesEngine.notes[i]);
    }
    notesEngine.notes = [];
  },

  update: function () {
    if (!gameEngine.isPlaying) return;

    // Move notes forward (towards the player)
    var difficultySettings = gameEngine.getCurrentDifficultySettings();
    for (var i = notesEngine.notes.length - 1; i >= 0; i--) {
      var note = notesEngine.notes[i];
      note.position.z += difficultySettings.scrollSpeed / 100; // Apply difficulty-based scroll speed

      // Remove notes that have passed the hit zone
      if (note.position.z > VISUAL.HIT_POSITION + 5) {
        notesEngine.remove(note);
        gameEngine.missNote();
        playNoteMiss();
      }
    }
  },

  hitNote: function (key) {
    var hitNote = null;
    var minDistance = Infinity;

    // Check for notes to hit
    for (var i = 0; i < notesEngine.notes.length; i++) {
      var note = notesEngine.notes[i];
      if (note.userData.key === key) {
        var distance = Math.abs(note.position.z - VISUAL.HIT_POSITION);

        if (distance < minDistance && distance < 3) {
          // Within hit range
          minDistance = distance;
          hitNote = note;
        }
      }
    }

    if (hitNote) {
      // Create visual hit effect before removing the note
      effectsManager.createHitEffect(
        hitNote.position,
        NOTE_COLORS[hitNote.userData.key]
      );

      // Reset the hitmarker since we successfully hit a note
      sceneManager.updateHitMarker(hitNote.userData.key, false);

      notesEngine.remove(hitNote);
      if (minDistance < 1) {
        gameEngine.goodNoteHit();
        playNoteHit(true); // Perfect hit
      } else {
        gameEngine.badNoteHit();
        playNoteHit(false); // Good hit but not perfect
      }
      return true;
    }

    // Return true if a note was hit
    return hitNote !== null;
  },

  spawnNote: function () {
    if (!gameEngine.isPlaying) return;

    var keys = ["A", "S", "D", "F", "G"];
    var randomKey = keys[Math.floor(Math.random() * keys.length)];
    notesEngine.add(randomKey);
  },
};

// Export for use in other modules
export { notesEngine };
