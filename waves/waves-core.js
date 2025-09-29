// PS3 XMB Waves Core System
// Main orchestration file that initializes and coordinates all wave components

import { initializeWebGL, setupCanvas } from './webgl-init.js';
import { getShaders } from './shaders.js';
import { createPerformanceTracker } from './performance.js';
import { makeFlowVertices } from './mesh-generation.js';
import { createDrawBackground, createDrawFlow, createDrawParticles } from './drawing-functions.js';
import { createAnimationSystem } from './animation.js';

// Global API
window.ps3Waves = {
  isReady: false,
  start: null,
  stop: null,
  updateParams: null,
  stats: null,
};

// Initialize the entire waves system
function initializeWavesSystem() {
  // Initialize WebGL
  const webglResult = initializeWebGL();
  if (!webglResult || !webglResult.gl) {
    console.error("Failed to initialize WebGL");
    window.ps3Waves.isReady = false;
    return;
  }

  const { gl, isWebGL2 } = webglResult;
  
  // Setup canvas
  setupCanvas();

  // Initialize REGL
  const regl = window.createREGL({
    gl,
    attributes: {
      antialias: false,
      preserveDrawingBuffer: true,
    },
    optionalExtensions: ["EXT_disjoint_timer_query"],
    profile: true,
    onDone: (err, reglInstance) => {
      if (err) {
        console.error("REGL initialization failed:", err);
        return;
      }
      try {
        initializeDrawingSystem(reglInstance, gl, isWebGL2);
        window.ps3Waves.isReady = true;
      } catch (error) {
        console.error("Failed to initialize drawing system:", error);
      }
    },
  });
}

function initializeDrawingSystem(regl, gl, isWebGL2) {
  // Initialize performance tracking
  const performanceTracker = createPerformanceTracker(gl);
  
  // Generate initial mesh
  let currentResolution = performanceTracker.getCurrentResolution();
  let flowMesh = makeFlowVertices(currentResolution);
  
  // Create drawing functions
  const drawBackground = createDrawBackground(regl, isWebGL2);
  let drawFlow = createDrawFlow(regl, flowMesh, currentResolution, isWebGL2);
  const drawParticles = createDrawParticles(regl, isWebGL2);

  // Mesh regeneration callback for performance system
  function regenerateMesh() {
    const newResolution = performanceTracker.getCurrentResolution();
    if (newResolution !== currentResolution) {
      currentResolution = newResolution;
      flowMesh = makeFlowVertices(currentResolution);
      drawFlow = createDrawFlow(regl, flowMesh, currentResolution, isWebGL2);
    }
  }

  // Initialize animation system
  const animationSystem = createAnimationSystem(
    regl,
    { drawBackground, drawFlow, drawParticles },
    performanceTracker,
    regenerateMesh
  );

  // Export API
  window.ps3Waves.start = animationSystem.start;
  window.ps3Waves.stop = animationSystem.stop;
  window.ps3Waves.updateParams = animationSystem.updateParams;
  window.ps3Waves.stats = animationSystem.getStats();
}

// Auto-initialize when script loads
initializeWavesSystem(); 