// effects.js
// Particle effects and visual enhancements

import * as THREE from "/node_modules/three/build/three.module.js";
import { sceneManager } from "./scene.js";
import { VISUAL } from "./constants.js";

class EffectsManager {
  constructor() {
    this.particles = [];
  }

  // Create hit effect at the given position with the specified color
  createHitEffect(position, color) {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorObj = new THREE.Color(color);
    const orangeColor = new THREE.Color(0xffa500);
    const redColor = new THREE.Color(0xff0000);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.3;

      const mixFactor = Math.random();
      const fireColor = new THREE.Color().lerpColors(
        orangeColor,
        redColor,
        mixFactor
      );
      fireColor.lerp(colorObj, 0.3);

      colors[i * 3] = fireColor.r;
      colors[i * 3 + 1] = fireColor.g;
      colors[i * 3 + 2] = fireColor.b;

      sizes[i] = Math.random() * 0.2 + 0.1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    sceneManager.getScene().add(particleSystem);
    this.particles.push({ system: particleSystem, life: 1 });
  }

  // Update particle effects
  updateParticles() {
    this.particles.forEach((particle, index) => {
      particle.life -= 0.02;
      if (particle.life <= 0) {
        sceneManager.getScene().remove(particle.system);
        this.particles.splice(index, 1);
      } else {
        this.updateParticleSystem(particle);
      }
    });
  }

  // Update individual particle system
  updateParticleSystem(particle) {
    const positions = particle.system.geometry.attributes.position.array;
    const sizes = particle.system.geometry.attributes.size.array;
    const colors = particle.system.geometry.attributes.color.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.05;
      positions[i + 1] += Math.random() * 0.03 + 0.01;
      positions[i + 2] += (Math.random() - 0.5) * 0.05;

      sizes[i / 3] *= 0.98;

      colors[i] = Math.min(colors[i] + 0.02, 1);
      colors[i + 1] = Math.min(colors[i + 1] + 0.01, 1);
      colors[i + 2] = Math.min(colors[i + 2] + 0.005, 1);
    }

    particle.system.geometry.attributes.position.needsUpdate = true;
    particle.system.geometry.attributes.size.needsUpdate = true;
    particle.system.geometry.attributes.color.needsUpdate = true;
    particle.system.material.opacity = particle.life;
  }

  // Update fret positions
  updateFrets(scrollSpeed) {
    sceneManager.getScrollingGroup().children.forEach((child) => {
      if (child.isFret) {
        child.position.z += scrollSpeed;
        if (child.position.z > VISUAL.FRETBOARD_LENGTH / 2) {
          child.position.z -= VISUAL.FRETBOARD_LENGTH;
        }
      }
    });
  }
}

// Export singleton instance
export const effectsManager = new EffectsManager();
