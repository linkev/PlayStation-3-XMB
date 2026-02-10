// Animation System Module
// Handles animation loop, timing, and parameter management

export function getDefaultParameters() {
  return {
    time: 0,
    color: [37 / 255, 89 / 255, 179 / 255], // Original XMB blue
    backgroundColor: [37, 89, 179], // RGB values for reference
    flowSpeed: 0.4,
    opacity: 0.5,
    brightness: 1.0,
    particleOpacity: 0.75,
    ratio: 1,
    // Wave parameters from LINE1.mnu
    damping: 0.0001,
    tension: 0.25,
    length: 0.306001,
    spacing: 407.658,
    perturbation: 0.0998587, // Don't change this
    ffdScale1: [5.67726, 1.00077, 1.0],
    ffdScale2: [2.82755, 1.27579, 2.88782],
    ffdOffset: [0.0, -0.469999, 0.0],
    // Particle parameters from PARTICLES.mnu
    emitVelMin: 0.15064,
    emitVelMul: 0.19,
    emitVelVar: 0.282567,
    emitConeAngle: 51.8695,
    emitNegProb: 0.173899,
    agingSpeed: 0.00285223,
    agingVariance: 0.493003,
    friction: 0.030551,
    gravity: -0.000068,
    windDir: [0.340188, 0.0, 0.35],
    windScale: 0.0,
    brownianScale: 0.225311
  };
}

export function createAnimationSystem(regl, drawFunctions, performanceTracker, meshRegenCallback) {
  const { drawBackground, drawFlow, drawParticles } = drawFunctions;
  const drawParams = getDefaultParameters();
  
  let lastTime = 0;
  let animationFrame = null;
  let stats = null;

  // Initialize stats.js if available
  if (typeof Stats !== 'undefined') {
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    stats.dom.style.position = 'relative';
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
      statsContainer.appendChild(stats.dom);
    }
  }

  function animate(context) {
    const startTime = performance.now();
    
    // Update stats
    if (stats) {
      stats.begin();
    }

    // Update color based on brightness
    drawParams.backgroundColor.forEach(
      (channel, i) => (drawParams.color[i] = (channel * drawParams.brightness) / 255)
    );
    
    drawParams.ratio = Math.max(1.0, Math.min(context.viewportWidth / context.viewportHeight, 2.0)) * 0.375;
    drawParams.time = drawParams.time + (context.time - lastTime) * drawParams.flowSpeed;
    lastTime = context.time;

    // Render
    drawBackground(drawParams);
    drawFlow(drawParams);
    drawParticles(drawParams);

    // Performance monitoring
    const frameDuration = performance.now() - startTime;
    if (performanceTracker.updateResolution(frameDuration)) {
      // Notify that mesh needs regeneration
      meshRegenCallback();
    }

    // Update stats
    if (stats) {
      stats.end();
    }
  }

  function startAnimation() {
    if (!animationFrame) {
      lastTime = 0;
      animationFrame = regl.frame(animate);
    }
  }

  function stopAnimation() {
    if (animationFrame) {
      animationFrame.cancel();
      animationFrame = null;
    }
  }

  function updateParams(newParams) {
    Object.assign(drawParams, newParams);
  }

  return {
    start: startAnimation,
    stop: stopAnimation,
    updateParams,
    getStats: () => stats
  };
} 