// scene.js
// Scene setup and rendering
import * as THREE from "three";
import { VISUAL, NOTE_COLORS, KEY_POSITIONS } from "./constants.js";
import { gameState } from "./gameState.js";

class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.scrollingGroup = null;
    this.lanes = {};
    this.debugLines = {};
    this.hitMarkers = {};
    this.backgroundMesh = null;
    this.currentBackground = "concert-stage-bg.jpg";
  }

  // Initialize Three.js scene
  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.setupCamera();
    this.setupScrollingGroup();
    this.setupBackground();
    this.setupEventListeners();
  }

  // Set up scene lighting
  setupLighting() {
    // Increased ambient light for overall brightness
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    // Main directional light - brighter and positioned better
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(0, 15, 10);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    // Additional fill light from the side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-10, 5, 5);
    this.scene.add(fillLight);

    // Back light to reduce shadows
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 5, -10);
    this.scene.add(backLight);
  }

  // Set up camera position
  setupCamera() {
    this.camera.position.set(0, 7, 15);
    this.camera.lookAt(0, 0, 0);
  }

  // Set up Guitar Hero-style background
  setupBackground() {
    // Load background texture
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load(
      "/images/concert-stage-bg.jpg",
      // Success callback
      (texture) => {
        // Configure texture for skybox
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;

        // Set the scene background
        this.scene.background = texture;
      },
      // Progress callback
      (progress) => {},
      // Error callback
      (error) => {
        console.error("Failed to load background texture:", error);
        // Set fallback background color
        this.scene.background = new THREE.Color(0x1a1a2e);
      }
    );

    // Store the texture for potential future use
    this.backgroundTexture = backgroundTexture;

    // Add stage lights/spotlights
    this.createStageLights();
  }

  // Create stage lighting effects
  createStageLights() {
    // Create spotlights pointing at the stage
    const spotlight1 = new THREE.SpotLight(
      0xff4444,
      0.8,
      100,
      Math.PI / 6,
      0.3
    );
    spotlight1.position.set(-20, 20, -10);
    spotlight1.target.position.set(0, 0, 0);
    this.scene.add(spotlight1);
    this.scene.add(spotlight1.target);

    const spotlight2 = new THREE.SpotLight(
      0x4444ff,
      0.8,
      100,
      Math.PI / 6,
      0.3
    );
    spotlight2.position.set(20, 20, -10);
    spotlight2.target.position.set(0, 0, 0);
    this.scene.add(spotlight2);
    this.scene.add(spotlight2.target);

    const spotlight3 = new THREE.SpotLight(
      0x44ff44,
      0.6,
      100,
      Math.PI / 6,
      0.3
    );
    spotlight3.position.set(0, 25, -15);
    spotlight3.target.position.set(0, 0, 0);
    this.scene.add(spotlight3);
    this.scene.add(spotlight3.target);
  }

  // Set up scrolling group
  setupScrollingGroup() {
    this.scrollingGroup = new THREE.Group();
    this.scene.add(this.scrollingGroup);
  }

  // Set up event listeners
  setupEventListeners() {
    window.addEventListener("resize", () => this.handleResize());
  }

  // Create the fretboard
  createFretboard() {
    // Main fretboard with gradient-like effect
    const fretboard = new THREE.Mesh(
      new THREE.BoxGeometry(
        VISUAL.TOTAL_WIDTH + 0.5,
        0.5,
        VISUAL.FRETBOARD_LENGTH
      ),
      new THREE.MeshPhongMaterial({
        color: 0x8a8a8a,
        shininess: 100,
        emissive: 0x2a2a2a,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.8,
      })
    );
    this.scrollingGroup.add(fretboard);

    // Add glowing edges
    const edgeGeometry = new THREE.BoxGeometry(
      VISUAL.TOTAL_WIDTH + 0.7,
      0.1,
      VISUAL.FRETBOARD_LENGTH + 0.2
    );
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.4,
    });

    const topEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    topEdge.position.y = 0.3;
    this.scrollingGroup.add(topEdge);

    const bottomEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    bottomEdge.position.y = -0.3;
    this.scrollingGroup.add(bottomEdge);
  }

  // Create lanes for each key
  createLanes() {
    Object.keys(KEY_POSITIONS).forEach((key) => {
      this.createLane(key);
      this.createCenterLine(key);
      this.createDebugLine(key);
    });
  }

  // Create individual lane
  createLane(key) {
    const laneGeometry = new THREE.PlaneGeometry(
      VISUAL.LANE_WIDTH,
      VISUAL.FRETBOARD_LENGTH
    );
    const laneMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
      emissive: 0x050505,
      emissiveIntensity: 0.1,
    });

    const lane = new THREE.Mesh(laneGeometry, laneMaterial);
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(KEY_POSITIONS[key], 0.26, 0);
    this.scrollingGroup.add(lane);
    this.lanes[key] = lane;
  }

  // Create center line for each lane
  createCenterLine(key) {
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: 1.0,
      transparent: false,
      linewidth: 2,
    });
    const points = [
      new THREE.Vector3(KEY_POSITIONS[key], 0.27, -VISUAL.FRETBOARD_LENGTH / 2),
      new THREE.Vector3(KEY_POSITIONS[key], 0.27, VISUAL.HIT_POSITION),
    ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const centerLine = new THREE.Line(lineGeometry, lineMaterial);
    this.scrollingGroup.add(centerLine);
  }

  // Create hit markers for each key
  createHitMarkers() {
    Object.keys(KEY_POSITIONS).forEach((key) => {
      const hitMarkerGroup = this.createHitMarker(key);
      hitMarkerGroup.position.set(
        KEY_POSITIONS[key],
        0.27,
        VISUAL.HIT_POSITION
      );
      this.scene.add(hitMarkerGroup);
      this.hitMarkers[key] = hitMarkerGroup;
    });
  }

  // Create individual hit marker
  createHitMarker(key) {
    const hitMarkerGroup = new THREE.Group();
    const color = NOTE_COLORS[key];

    // Outer ring
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(VISUAL.HIT_MARKER_RADIUS - 0.05, 0.05, 16, 100),
      new THREE.MeshPhongMaterial({ color: color, shininess: 100 })
    );
    outerRing.rotation.x = Math.PI / 2;
    hitMarkerGroup.add(outerRing);

    // Middle ring
    const middleRing = new THREE.Mesh(
      new THREE.TorusGeometry(VISUAL.HIT_MARKER_RADIUS - 0.15, 0.05, 16, 100),
      new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 })
    );
    middleRing.rotation.x = Math.PI / 2;
    hitMarkerGroup.add(middleRing);

    // Inner fill
    const innerFill = new THREE.Mesh(
      new THREE.CylinderGeometry(
        VISUAL.HIT_MARKER_RADIUS - 0.2,
        VISUAL.HIT_MARKER_RADIUS - 0.2,
        0.05,
        32
      ),
      new THREE.MeshPhongMaterial({ color: 0x464646, shininess: 100 })
    );
    hitMarkerGroup.add(innerFill);

    return hitMarkerGroup;
  }

  // Create frets on the fretboard
  createFrets() {
    const fretMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      emissive: 0x222222,
      emissiveIntensity: 0.3,
    });

    for (let i = 0; i < VISUAL.NUM_FRETS; i++) {
      const fretGeometry = new THREE.BoxGeometry(
        VISUAL.TOTAL_WIDTH + 0.5,
        VISUAL.FRET_THICKNESS,
        VISUAL.FRET_THICKNESS
      );
      const fret = new THREE.Mesh(fretGeometry, fretMaterial);

      const zPosition =
        -VISUAL.FRETBOARD_LENGTH / 2 +
        (VISUAL.FRETBOARD_LENGTH / (VISUAL.NUM_FRETS - 1)) * i;
      fret.position.set(0, 0.26, zPosition);

      fret.isFret = true;
      this.scrollingGroup.add(fret);
    }
  }

  // Create debug lines for each lane
  createDebugLine(key) {
    const debugLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const debugPoints = [
      new THREE.Vector3(
        KEY_POSITIONS[key] - VISUAL.LANE_WIDTH / 2,
        0.27,
        -VISUAL.FRETBOARD_LENGTH / 2
      ),
      new THREE.Vector3(
        KEY_POSITIONS[key] - VISUAL.LANE_WIDTH / 2,
        0.27,
        VISUAL.FRETBOARD_LENGTH / 2
      ),
      new THREE.Vector3(
        KEY_POSITIONS[key] + VISUAL.LANE_WIDTH / 2,
        0.27,
        VISUAL.FRETBOARD_LENGTH / 2
      ),
      new THREE.Vector3(
        KEY_POSITIONS[key] + VISUAL.LANE_WIDTH / 2,
        0.27,
        -VISUAL.FRETBOARD_LENGTH / 2
      ),
      new THREE.Vector3(
        KEY_POSITIONS[key] - VISUAL.LANE_WIDTH / 2,
        0.27,
        -VISUAL.FRETBOARD_LENGTH / 2
      ),
    ];
    const debugLineGeometry = new THREE.BufferGeometry().setFromPoints(
      debugPoints
    );
    const debugLine = new THREE.Line(debugLineGeometry, debugLineMaterial);
    debugLine.visible = false;
    this.scene.add(debugLine);
    this.debugLines[key] = debugLine;
  }

  // Handle window resize
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Toggle debug mode
  toggleDebugMode() {
    Object.values(this.debugLines).forEach(
      (line) => (line.visible = gameState.debugMode)
    );
  }

  // Update hit marker appearance
  updateHitMarker(key, isPressed) {
    const color = isPressed ? NOTE_COLORS[key] : 0x464646;
    this.hitMarkers[key].children[2].material.color.setHex(color);
  }

  // Render the scene
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // Get scene reference for other modules
  getScene() {
    return this.scene;
  }

  // Get scrolling group reference for other modules
  getScrollingGroup() {
    return this.scrollingGroup;
  }

  // Change background image
  changeBackground(imageName) {
    const textureLoader = new THREE.TextureLoader();
    const newTexture = textureLoader.load(
      `/images/${imageName}`,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        this.scene.background = texture;
        this.backgroundTexture = texture;
        this.currentBackground = imageName;
      },
      undefined,
      (error) => {
        console.warn(`Failed to load background: ${imageName}`, error);
        this.scene.background = new THREE.Color(0x1a1a2e);
      }
    );
  }

  // Get current background
  getCurrentBackground() {
    return this.currentBackground;
  }
}

// Export singleton instance
export const sceneManager = new SceneManager();
