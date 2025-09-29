// Performance Monitoring and GPU Scoring Module
// Handles performance tracking, adaptive resolution, and GPU capability detection

export const RESOLUTION_LIMITS = {
  min: 40,
  max: 80,
  default: 60,
};

// GPU performance caching
const GPU_SCORE_CACHE_KEY = 'ps3waves-gpu-score';
const GPU_SCORE_VERSION = '2';

export function getGPUScore(gl) {
  const cached = localStorage.getItem(GPU_SCORE_CACHE_KEY);
  if (cached) {
    try {
      const { score, version } = JSON.parse(cached);
      if (version === GPU_SCORE_VERSION) {
        return score;
      }
    } catch (e) {
      console.warn('Invalid GPU score cache');
    }
  }
  
  const score = calculateGPUScore(gl);
  try {
    localStorage.setItem(GPU_SCORE_CACHE_KEY, JSON.stringify({
      score,
      version: GPU_SCORE_VERSION
    }));
  } catch (e) {
    console.warn('Failed to cache GPU score');
  }
  return score;
}

function calculateGPUScore(gl) {
  let score = 0;
  const extensions = [
    "EXT_texture_filter_anisotropic",
    "WEBGL_compressed_texture_s3tc",
    "WEBGL_draw_buffers",
  ];
  score += (extensions.filter((ext) => gl.getExtension(ext)).length / extensions.length) * 0.5;
  
  const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  score += Math.min(Math.max((maxTexSize - 2048) / (8192 - 2048), 0), 1) * 0.3;
  
  const textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  score += Math.min(textureUnits / 16, 1) * 0.2;
  
  return score;
}

export function createPerformanceTracker(gl) {
  const frameTimings = new Array(30).fill(16.67);
  let frameIndex = 0;
  let currentResolution = RESOLUTION_LIMITS.default;
  const gpuScore = getGPUScore(gl);
  
  function updateResolution(frameDuration) {
    frameTimings[frameIndex] = frameDuration;
    frameIndex = (frameIndex + 1) % frameTimings.length;
    
    const avgFrameTime = frameTimings.reduce((a, b) => a + b) / frameTimings.length;
    const viewportScore = Math.min((gl.canvas.width * gl.canvas.height) / (1920 * 1080), 1);
    const performanceScore = Math.min(16.67 / avgFrameTime, 1);
    
    const baseResolution = RESOLUTION_LIMITS.min + 
      (RESOLUTION_LIMITS.max - RESOLUTION_LIMITS.min) * 
      Math.min(gpuScore * 0.6 + viewportScore * 0.4, 1) * performanceScore;
    
    const newResolution = Math.round(currentResolution * 0.8 + baseResolution * 0.2);
    
    if (Math.abs(newResolution - currentResolution) >= 2) {
      currentResolution = newResolution;
      return true;
    }
    return false;
  }
  
  return {
    updateResolution,
    getCurrentResolution: () => currentResolution,
    getGPUScore: () => gpuScore
  };
} 