// WebGL Initialization Module
// Handles WebGL context setup and basic configuration

export function initializeWebGL() {
  const canvas = document.getElementById("waves-background");
  let gl = canvas.getContext("webgl2");
  const isWebGL2 = !!gl;
  if (!gl) {
    console.log("WebGL2 not available, falling back to WebGL1");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  return {
    gl,
    isWebGL2
  };
}

export function setupCanvas() {
  function resizeCanvas() {
    const canvas = document.getElementById("waves-background");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  return resizeCanvas;
} 