// audioManager.js - Exactly like taptaptap habibiScript.js

// Function to parse music.xml and extract song information
function parseMusicXML() {
  return new Promise((resolve, reject) => {
    fetch("/music.xml")
      .then((response) => response.text())
      .then((xmlText) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const songs = [];
        const arrangements = xmlDoc.querySelectorAll("arrangement");

        arrangements.forEach((arrangement) => {
          const classAttr = arrangement.getAttribute("class");
          const track = arrangement.querySelector("track");
          const src = track ? track.getAttribute("src") : "";

          if (classAttr && src) {
            // Extract display name from class (convert camelCase to Title Case)
            const displayName = classAttr
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .trim();

            songs.push({
              songClass: classAttr,
              displayName: displayName,
              src: src,
            });
          }
        });

        resolve(songs);
      })
      .catch((error) => {
        console.warn("Failed to parse music.xml:", error);
        // Fallback to empty array if XML parsing fails
        resolve([]);
      });
  });
}

var audioPool = {
  sounds: [
    { sound: "button-click", preload: true, volume: 0.6, loop: false },
    { sound: "note-miss", preload: true, volume: 0.6, loop: false },
  ],
  createAudioPlayer: function (element) {
    element.audioPlayer = document.createElement("audio");

    var mp3Source = document.createElement("source");
    var oggSource = document.createElement("source");

    // Get the name of the sounds from the object inside the array
    var mp3Link = "audio/sfx/" + element.sound + ".mp3";
    var oggLink = "audio/sfx/" + element.sound + ".ogg";

    // Setting the attributes for the source elements
    mp3Source.setAttribute("type", "audio/mpeg");
    oggSource.setAttribute("type", "audio/ogg");
    mp3Source.setAttribute("src", mp3Link);
    oggSource.setAttribute("src", oggLink);

    // Add error handling for audio loading
    element.audioPlayer.addEventListener("error", function (e) {
      console.warn(
        `Warning: The audio file for ${element.sound} could not be found. It should be called ${element.sound}.mp3 and placed in the /public/audio/sfx/ folder`
      );
    });

    mp3Source.addEventListener("error", function (e) {
      console.warn(
        `Warning: The audio file for ${element.sound} could not be found. It should be called ${element.sound}.mp3 and placed in the /public/audio/sfx/ folder`
      );
    });

    oggSource.addEventListener("error", function (e) {
      console.warn(
        `Warning: The audio file for ${element.sound} could not be found. It should be called ${element.sound}.ogg and placed in the /public/audio/sfx/ folder`
      );
    });

    // Appending the sources to the player, and appending the player to the page
    element.audioPlayer.appendChild(mp3Source);
    element.audioPlayer.appendChild(oggSource);
    document.body.appendChild(element.audioPlayer);

    element.audioPlayer.volume = element.volume; // setting the volume

    if (element.preload) {
      element.audioPlayer.load(); // preload the sound
    }
    if (element.loop) {
      // repeat sound
      element.audioPlayer.loop = true;
    }
  },
  addSounds: function () {
    // Create a player for each sound
    for (var i = 0; i < audioPool.sounds.length; i++) {
      audioPool.createAudioPlayer(audioPool.sounds[i]);
    }
  },
  playSound: function (soundName) {
    if (soundName.audioPlayer) {
      soundName.audioPlayer.currentTime = 0;
      soundName.audioPlayer.play().catch(function (error) {
        console.warn("Error playing sound:", error);
      });
    } else {
      console.error("No audio player found for sound:", soundName.sound);
    }
  },
  stopSound: function (soundName) {
    soundName.audioPlayer.pause();
    soundName.audioPlayer.currentTime = 0;
  },
};

audioPool.addSounds(); // Add sounds to the page in separate audio players

// Helper function to find sound by name (ES6 compatible)
function findSound(soundName) {
  return audioPool.sounds.find((sound) => sound.sound === soundName);
}

// Helper function to get current song class (like taptap)
function getCurrentSongClass() {
  if (!window.gameEngine || !window.gameEngine.selectedSong) {
    return "tarzan";
  }

  // Use the songClass directly from the constants
  return window.gameEngine.selectedSong.songClass;
}

// Simple audio functions (ES6 compatible)
function playButtonClick() {
  var sound = findSound("ui/button-click");
  if (sound) audioPool.playSound(sound);
}

function playButtonHover() {
  // No sound file exists
}

function playMenuOpen() {
  // No sound file exists
}

function playMenuClose() {
  // No sound file exists
}

function playNoteHit(perfect = false) {
  // No sound file exists
}

function playNoteMiss() {
  var sound = findSound("game/note-miss");
  if (sound) audioPool.playSound(sound);
}

function playSongStart() {
  const songClass = getCurrentSongClass();
  waxml.trig(songClass);
}

function playSongEnd() {
  waxml.stop();
}

function playSongComplete() {
  // No sound file exists
}

function playCombo(comboCount) {
  // No sound file exists
}

function playStreakBreak() {
  // No sound file exists
}

function playGamePause() {
  // No sound file exists
}

function playGameResume() {
  // No sound file exists
}

function playDifficultyChange() {
  // No sound file exists
}

function startMusic() {
  const songClass = getCurrentSongClass();
  waxml.trig(songClass);
}

function stopMusic() {
  waxml.stop();
}

function pauseMusic() {
  waxml.stop();
}

function resumeMusic() {
  const songClass = getCurrentSongClass();
  waxml.trig(songClass);
}

// Export the functions for use in other modules
export {
  playButtonClick,
  playButtonHover,
  playNoteHit,
  playNoteMiss,
  playSongStart,
  playSongEnd,
  playCombo,
  playStreakBreak,
  playMenuOpen,
  playMenuClose,
  playSongComplete,
  playGamePause,
  playGameResume,
  playDifficultyChange,
  startMusic,
  stopMusic,
  pauseMusic,
  resumeMusic,
  parseMusicXML,
};
