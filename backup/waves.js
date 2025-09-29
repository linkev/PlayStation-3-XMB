window.ps3Waves = {
  isReady: false,
  start: null,
  stop: null,
  updateParams: null,
  stats: null,
};
function initializeWebGL() {
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
const {
  gl,
  isWebGL2
} = initializeWebGL() || {
  gl: null,
  isWebGL2: false
};
if (!gl) {
  console.error("Failed to initialize WebGL");
  window.ps3Waves.isReady = false;
} else {
  // Shader definitions
  const SHADERS = {
    background: {
      vert: `${isWebGL2 ? "#version 300 es\n" : ""}
        precision highp float;
        ${isWebGL2 ? "in" : "attribute"} vec2 position;
        uniform vec2 u_resolution;
        ${isWebGL2 ? "out" : "varying"} vec2 v_pos;
        ${isWebGL2 ? "out" : "varying"} float v_gradient;
        void main() {
          v_pos = (position + 1.0) / 2.0 * u_resolution;
          v_gradient = 1.0 - position.y * 0.625;
          gl_Position = vec4(position, 0.0, 1.0);
        }`,
      frag: `${isWebGL2 ? "#version 300 es\n" : ""}
        precision highp float;
        uniform vec3 u_color;
        uniform vec2 u_resolution;
        uniform sampler2D u_bayerTexture;
        ${isWebGL2 ? "in" : "varying"} vec2 v_pos;
        ${isWebGL2 ? "in" : "varying"} float v_gradient;
        ${isWebGL2 ? "out vec4 fragColor;\n" : ""}
        const float colorDepth = 255.0;
        
        vec3 dither(vec2 position, vec3 color) {
          float threshold = texture${isWebGL2 ? "" : "2D"}(u_bayerTexture, position / 8.0).a;
          vec3 diff = 1.0 - mod(color * colorDepth, 1.0);
          return color + diff * vec3(
            float(diff.r < threshold),
            float(diff.g < threshold),
            float(diff.b < threshold)
          ) / colorDepth;
        }
        
        void main() {
          ${isWebGL2 ? "fragColor" : "gl_FragColor"} = vec4(dither(v_pos, v_gradient * u_color), 1.0);
        }`,
    },
    flow: {
      vert: `#version ${isWebGL2 ? "300 es" : "100"}
        ${isWebGL2 ? "in" : "attribute"} vec2 position;
        uniform float uTime;
        uniform float ratio;
        uniform float step;
        uniform float opacity;
        uniform float flowSpeed;
        uniform float damping;
        uniform float tension;
        uniform float length;
        uniform float spacing;
        uniform float perturbation;
        uniform vec3 ffdScale1;
        uniform vec3 ffdScale2;
        uniform vec3 ffdOffset;
        ${isWebGL2 ? "out" : "varying"} vec2 vUv;
        ${isWebGL2 ? "out" : "varying"} vec3 vPosition;
        
        float hash(float n) {
          return fract(sin(n) * 1e4);
        }
        
        float hash(vec2 p) {
          return fract(1e4 * sin(17. * p.x + p.y * .1) * (.1 + abs(sin(p.y * 13. + p.x))));
        }
        
        float noise(float x) {
          float i = floor(x);
          float f = fract(x);
          float u = f * f * (3. - 2. * f);
          return mix(hash(i), hash(i + 1.), u);
        }
        
        float noise(vec2 x) {
          vec2 i = floor(x);
          vec2 f = fract(x);
          float a = hash(i);
          float b = hash(i + vec2(1., 0.));
          float c = hash(i + vec2(0., 1.));
          float d = hash(i + vec2(1., 1.));
          vec2 u = f * f * (3. - 2. * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
        }
        
        float noise(vec3 x) {
          const vec3 step = vec3(110, 241, 171);
          vec3 i = floor(x);
          vec3 f = fract(x);
          float n = dot(i, step);
          vec3 u = f * f * (3. - 2. * f);
          return mix(
            mix(mix(hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                mix(hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
            mix(mix(hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                mix(hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
        }
        
        float xmbNoise(vec3 x) {
          return cos(x.z * 4.) * cos(x.z + uTime / 10. + x.x);
        }
        
        void main() {
          vec3 p = vec3(position.x, 0., position.y);
          p.y = xmbNoise(p) / 8.;
          
          // Apply FFD (Free Form Deformation) from PS3 XMB
          vec3 ffd1 = p * ffdScale1 + ffdOffset;
          vec3 ffd2 = p * ffdScale2 + ffdOffset;
          p.y += sin(ffd1.x + uTime * flowSpeed) * 0.1;
          p.z += cos(ffd2.z + uTime * flowSpeed) * 0.1;
          
          vec3 p2 = p;
          p2.x -= uTime * flowSpeed;
          p2.x /= 4.;
          p2.y -= uTime / 100.;
          p2.z -= uTime / 10.;
          
          // Incorporate wave dynamics
          float waveHeight = noise(p2 * 8.) / 12. + cos(p.x * 2. - uTime / 2.) / 5. - 0.1;
          waveHeight *= (1.0 - damping);
          waveHeight += tension * sin(p.x * length + uTime * flowSpeed);
          waveHeight += perturbation * noise(p2 * spacing);
          p.y -= waveHeight;
          p.z -= noise(p2 * 8.) / 12.;
          
          vec4 modelPosition = vec4(p, 1.);
          gl_Position = modelPosition;
          
          vUv = (position + 1.) / 2.;
          vPosition = p;
        }`,
      frag: `#version ${isWebGL2 ? "300 es" : "100"}
        precision lowp float;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float opacity;
        uniform float brightness;
        ${isWebGL2 ? "in" : "varying"} vec2 vUv;
        ${isWebGL2 ? "in" : "varying"} vec3 vPosition;
        ${isWebGL2 ? "out vec4 fragColor;" : ""}
        
        vec3 computeNormal(vec3 pos) {
          vec3 X = dFdx(pos);
          vec3 Y = dFdy(pos);
          vec3 cNormal = normalize(cross(X, Y));
          return cNormal;
        }
        
        float fresnel(float bias, float scale, float power, vec3 I, vec3 N) {
          return bias + scale * pow(1. + dot(I, N), power);
        }
        
        void main() {
          vec3 color = vec3(1.);
          vec3 cNormal = computeNormal(vPosition);
          vec3 eyeVector = vec3(0., 0., -1.);
          float F = fresnel(0., .5, 4., eyeVector, cNormal);
          float alpha = F * opacity * brightness;
          ${isWebGL2 ? "fragColor" : "gl_FragColor"} = vec4(color, alpha);
        }`,
    },
    particle: {
      vert: `#version ${isWebGL2 ? "300 es" : "100"}
        ${isWebGL2 ? "in" : "attribute"} vec3 seed;
        uniform float uTime;
        uniform float ratio;
        uniform float particleOpacity;
        uniform float flowSpeed;
        uniform float emitVelMin;
        uniform float emitVelMul;
        uniform float emitVelVar;
        uniform float emitConeAngle;
        uniform float emitNegProb;
        uniform float agingSpeed;
        uniform float agingVariance;
        uniform float friction;
        uniform float gravity;
        uniform vec3 windDir;
        uniform float windScale;
        uniform float brownianScale;
        ${isWebGL2 ? "out" : "varying"} float alpha;
        
        float hash(float n) {
          return fract(sin(n) * 1e4);
        }
        
        float noise(vec2 x) {
          vec2 i = floor(x);
          vec2 f = fract(x);
          float a = hash(dot(i, vec2(1., 57.)));
          float b = hash(dot(i + vec2(1., 0.), vec2(1., 57.)));
          float c = hash(dot(i + vec2(0., 1.), vec2(1., 57.)));
          float d = hash(dot(i + vec2(1., 1.), vec2(1., 57.)));
          vec2 u = f * f * (3. - 2. * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
        }
        
        float xmbNoise(vec3 x) {
          return cos(x.z * 4.) * cos(x.z + uTime / 10. + x.x);
        }
        
        float getWaveHeight(vec2 pos) {
          vec3 p = vec3(pos.x, 0., pos.y);
          float height = xmbNoise(p) / 8.;
          
          vec3 p2 = p;
          p2.x -= uTime * flowSpeed;
          p2.x /= 4.;
          p2.y -= uTime / 100.;
          p2.z -= uTime / 10.;
          
          height -= noise(p2.xz * 8.) / 12. + cos(pos.x * 2. - uTime / 2.) / 5. - 0.1;
          return height;
        }
        
        void main() {
          gl_PointSize = seed.z * 8. + 4.;
          
          float time = uTime * flowSpeed;
          float x = fract(time * (seed.x - 0.5) / 15. + seed.y * 50.) * 2. - 1.;
          float y = sin(sign(seed.y) * time * (seed.y + 1.5) / 4. + seed.x * 100.);
          y /= ((6. - seed.x * 4. * seed.y) / ratio);
          
          // Apply particle physics from PS3 XMB
          float age = fract(seed.x + time * agingSpeed * (1.0 + agingVariance * seed.y));
          float vel = emitVelMin + emitVelMul * (1.0 + emitVelVar * seed.z);
          if (seed.y < emitNegProb) vel = -vel;
          float coneFactor = cos(emitConeAngle * 3.14159 / 180.0);
          vel *= coneFactor;
          y += vel * age;
          y += gravity * age * age;
          y *= (1.0 - friction * age);
          
          // Wind effect
          x += windDir.x * windScale * age;
          y += windDir.y * windScale * age;
          
          // Brownian motion
          float brownian = noise(vec2(x, y) * 10.0) * brownianScale;
          x += brownian;
          y += brownian;
          
          float waveHeight = getWaveHeight(vec2(x, seed.y));
          y += waveHeight;
          
          float opacityVariance = mix(
            sin(time * (seed.x + 0.5) * 12. + seed.y * 10.),
            sin(time * (seed.y + 1.5) * 6. + seed.x * 4.),
            y * 0.5 + 0.5) * seed.x + seed.y;
          alpha = particleOpacity * opacityVariance * opacityVariance * (1.0 - age);
          
          gl_Position = vec4(x, y, 0., 1.);
        }`,
      frag: `#version ${isWebGL2 ? "300 es" : "100"}
        precision lowp float;
        ${isWebGL2 ? "in" : "varying"} float alpha;
        ${isWebGL2 ? "out vec4 fragColor;" : ""}
        void main() {
          vec2 cxy = gl_PointCoord * 2. - 1.;
          float radius = dot(cxy, cxy);
          float sparkle = max(0., 1. - radius);
          ${isWebGL2 ? "fragColor" : "gl_FragColor"} = vec4(vec3(alpha * sparkle), 1.);
        }`,
    },
  };
  // Canvas setup
  function resizeCanvas() {
    const canvas = document.getElementById("waves-background");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  // REGL initialization
  const regl = createREGL({
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
        initializeDrawingFunctions(reglInstance);
        window.ps3Waves.isReady = true;
      } catch (error) {
        console.error("Failed to initialize drawing functions:", error);
      }
    },
  });
  function initializeDrawingFunctions(regl) {
    // Initialize stats.js
    let stats = null;
    if (typeof Stats !== 'undefined') {
      stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb
      stats.dom.style.position = 'relative';
      const statsContainer = document.getElementById('stats-container');
      if (statsContainer) {
        statsContainer.appendChild(stats.dom);
      }
      window.ps3Waves.stats = stats;
    }

    // Constants
    const NUM_PARTICLES = 300;
    const RESOLUTION_LIMITS = {
      min: 40,
      max: 80,
      default: 60,
    };
    // Performance tracking
    let currentResolution = RESOLUTION_LIMITS.default;
    const frameTimings = new Array(30).fill(16.67);
    let frameIndex = 0;
    // GPU performance caching
    const GPU_SCORE_CACHE_KEY = 'ps3waves-gpu-score';
    const GPU_SCORE_VERSION = '2';
    function getGPUScore() {
      const cached = localStorage.getItem(GPU_SCORE_CACHE_KEY);
      if (cached) {
        try {
          const {
            score,
            version
          } = JSON.parse(cached);
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
      const extensions = ["EXT_texture_filter_anisotropic", "WEBGL_compressed_texture_s3tc", "WEBGL_draw_buffers", ];
      score += (extensions.filter((ext) => gl.getExtension(ext)).length / extensions.length) * 0.5;
      const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      score += Math.min(Math.max((maxTexSize - 2048) / (8192 - 2048), 0), 1) * 0.3;
      const textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      score += Math.min(textureUnits / 16, 1) * 0.2;
      return score;
    }
    const gpuScore = getGPUScore();
    // Adaptive resolution system
    function updateResolution(frameDuration) {
      frameTimings[frameIndex] = frameDuration;
      frameIndex = (frameIndex + 1) % frameTimings.length;
      const avgFrameTime = frameTimings.reduce((a, b) => a + b) / frameTimings.length;
      const viewportScore = Math.min((gl.canvas.width * gl.canvas.height) / (1920 * 1080), 1);
      const performanceScore = Math.min(16.67 / avgFrameTime, 1);
      const baseResolution = RESOLUTION_LIMITS.min + (RESOLUTION_LIMITS.max - RESOLUTION_LIMITS.min) * Math.min(gpuScore * 0.6 + viewportScore * 0.4, 1) * performanceScore;
      const newResolution = Math.round(currentResolution * 0.8 + baseResolution * 0.2);
      if (Math.abs(newResolution - currentResolution) >= 2) {
        currentResolution = newResolution;
        return true;
      }
      return false;
    }
    // Mesh generation
    let flowMesh = makeFlowVertices(currentResolution);
    let drawFlow = createDrawFlow(regl, flowMesh);
    function makeFlowVertices(resolution) {
      const verticesPerStrip = resolution * 2;
      const numStrips = resolution - 1;
      const vertices = new Float32Array(verticesPerStrip * numStrips * 2);
      let vIdx = 0;
      for (let y = 0; y < resolution - 1; y++) {
        for (let x = 0; x < resolution; x++) {
          vertices[vIdx++] = (x / (resolution - 1)) * 2 - 1;
          vertices[vIdx++] = ((y + 1) / (resolution - 1)) * 2 - 1;
          vertices[vIdx++] = (x / (resolution - 1)) * 2 - 1;
          vertices[vIdx++] = (y / (resolution - 1)) * 2 - 1;
        }
      }
      const indices = new Uint16Array(numStrips * (resolution * 2 + 2) - 2);
      let iIdx = 0;
      let baseVertex = 0;
      for (let strip = 0; strip < numStrips; strip++) {
        if (strip > 0) {
          indices[iIdx++] = baseVertex - 1;
          indices[iIdx++] = baseVertex;
        }
        for (let i = 0; i < resolution * 2; i++) {
          indices[iIdx++] = baseVertex + i;
        }
        baseVertex += resolution * 2;
      }
      return {
        vertices: vertices,
        indices: indices,
        vertexCount: vertices.length / 2,
        stripCount: numStrips,
      };
    }
    function makeParticleSeeds() {
      const seeds = new Float32Array(NUM_PARTICLES * 3);
      let numSeeds = 0;
      for (let i = 0; i < NUM_PARTICLES; i++) {
        seeds[numSeeds++] = Math.random();
        seeds[numSeeds++] = Math.random();
        seeds[numSeeds++] = Math.pow(Math.random(), 8) + 0.1;
      }
      return seeds;
    }
    // Drawing functions
    const drawBackground = regl({
      vert: SHADERS.background.vert,
      frag: SHADERS.background.frag,
      primitive: "triangle strip",
      count: 4,
      attributes: {
        position: [+1, -1, -1, -1, +1, +1, -1, +1],
      },
      uniforms: {
        u_color: regl.prop("color"),
        u_resolution: (context) => [context.viewportWidth, context.viewportHeight],
        u_bayerTexture: regl.texture({
          data: new Uint8Array([
            0, 128, 32, 160, 8, 136, 40, 168, 192, 64, 224, 96, 200, 72, 232,
            104, 48, 176, 16, 144, 56, 184, 24, 152, 240, 112, 208, 80, 248,
            120, 216, 88, 12, 140, 44, 172, 4, 132, 36, 164, 204, 76, 236, 108,
            196, 68, 228, 100, 60, 188, 28, 156, 52, 180, 20, 148, 252, 124,
            220, 92, 244, 116, 212, 84,
          ]),
          format: "alpha",
          shape: [8, 8],
          wrap: ["repeat", "repeat"],
        }),
      },
      depth: {
        enable: false
      },
    });
    function createDrawFlow(regl, mesh) {
      return regl({
        vert: SHADERS.flow.vert,
        frag: SHADERS.flow.frag,
        primitive: "triangle strip",
        elements: mesh.indices,
        attributes: {
          position: {
            buffer: regl.buffer(mesh.vertices),
            stride: 8,
            offset: 0,
          },
        },
        uniforms: {
          uTime: regl.prop("time"),
          uResolution: (context) => [context.viewportWidth, context.viewportHeight],
          opacity: regl.prop("opacity"),
          brightness: regl.prop("brightness"),
          ratio: regl.prop("ratio"),
          step: 2 / currentResolution,
          flowSpeed: regl.prop("flowSpeed"),
          damping: regl.prop("damping"),
          tension: regl.prop("tension"),
          length: regl.prop("length"),
          spacing: regl.prop("spacing"),
          perturbation: regl.prop("perturbation"),
          ffdScale1: regl.prop("ffdScale1"),
          ffdScale2: regl.prop("ffdScale2"),
          ffdOffset: regl.prop("ffdOffset"),
        },
        blend: {
          enable: true,
          func: {
            srcRGB: 'src alpha',
            srcAlpha: 1,
            dstRGB: 'one minus src alpha',
            dstAlpha: 1
          },
        },
        depth: {
          enable: false
        },
        dither: false,
        instances: 1,
      });
    }
    const drawParticles = regl({
      vert: SHADERS.particle.vert,
      frag: SHADERS.particle.frag,
      primitive: "points",
      count: NUM_PARTICLES,
      attributes: {
        seed: makeParticleSeeds(),
      },
      uniforms: {
        uTime: regl.prop("time"),
        ratio: regl.prop("ratio"),
        particleOpacity: regl.prop("particleOpacity"),
        flowSpeed: regl.prop("flowSpeed"),
        emitVelMin: regl.prop("emitVelMin"),
        emitVelMul: regl.prop("emitVelMul"),
        emitVelVar: regl.prop("emitVelVar"),
        emitConeAngle: regl.prop("emitConeAngle"),
        emitNegProb: regl.prop("emitNegProb"),
        agingSpeed: regl.prop("agingSpeed"),
        agingVariance: regl.prop("agingVariance"),
        friction: regl.prop("friction"),
        gravity: regl.prop("gravity"),
        windDir: regl.prop("windDir"),
        windScale: regl.prop("windScale"),
        brownianScale: regl.prop("brownianScale"),
      },
      blend: {
        enable: true,
        func: {
          src: 1,
          dst: 1
        },
      },
      dither: false,
      depth: {
        enable: false
      },
    });
    // Default parameters - Original XMB blue only
    const drawParams = {
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
    // Animation system
    let lastTime = 0;
    let animationFrame = null;
    function animate(context) {
      const startTime = performance.now();
      
      // Update stats
      if (stats) {
        stats.begin();
      }
      // Update color based on brightness
      drawParams.backgroundColor.forEach(
        (channel, i) => (drawParams.color[i] = (channel * drawParams.brightness) / 255));
      drawParams.ratio = Math.max(1.0, Math.min(context.viewportWidth / context.viewportHeight, 2.0)) * 0.375;
      drawParams.time = drawParams.time + (context.time - lastTime) * drawParams.flowSpeed;
      lastTime = context.time;
      // Render
      drawBackground(drawParams);
      drawFlow(drawParams);
      drawParticles(drawParams);
      // Performance monitoring
      const frameDuration = performance.now() - startTime;
      if (updateResolution(frameDuration)) {
        flowMesh = makeFlowVertices(currentResolution);
        drawFlow = createDrawFlow(regl, flowMesh);
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
    // Export API
    window.ps3Waves.start = startAnimation;
    window.ps3Waves.stop = stopAnimation;
    window.ps3Waves.updateParams = (newParams) => {
      Object.assign(drawParams, newParams);
    };
  }
}