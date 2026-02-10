'use strict';
// Spline layer renderer: builds background/wave WebGL programs and draws the main XMB wave mesh each frame.
// Consumes `SPLINE_SETTINGS` + `PS3SplineReverse` (from `spline-settings.js` and `spline-reverse.js`) and is called by `index.html`.

(function () {
  function compile(gl, src, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || 'shader compile failed';
      gl.deleteShader(shader);
      throw new Error(info);
    }
    return shader;
  }

  function link(gl, vsSrc, fsSrc) {
    const program = gl.createProgram();
    const vs = compile(gl, vsSrc, gl.VERTEX_SHADER);
    const fs = compile(gl, fsSrc, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) || 'program link failed';
      gl.deleteProgram(program);
      throw new Error(info);
    }
    return program;
  }

  function uloc(gl, program, name) { return gl.getUniformLocation(program, name); }

  function aloc(gl, program, name) {
    const loc = gl.getAttribLocation(program, name);
    if (loc < 0) throw new Error('Missing attribute: ' + name);
    return loc;
  }

  function createFullscreenQuad(gl, program) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = aloc(gl, program, 'aPos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
  }

  function createGrid(gl, program, res) {
    const strips = res - 1;
    const vertsPerStrip = res * 2;
    const verts = new Float32Array(strips * vertsPerStrip * 2);
    let vi = 0;

    for (let y = 0; y < strips; y++) {
      for (let x = 0; x < res; x++) {
        const fx = (x / (res - 1)) * 2 - 1;
        verts[vi++] = fx;
        verts[vi++] = ((y + 1) / (res - 1)) * 2 - 1;
        verts[vi++] = fx;
        verts[vi++] = (y / (res - 1)) * 2 - 1;
      }
    }

    const idx = new Uint16Array(strips * (vertsPerStrip + 2) - 2);
    let ii = 0;
    let base = 0;
    for (let s = 0; s < strips; s++) {
      if (s > 0) {
        idx[ii++] = base - 1;
        idx[ii++] = base;
      }
      for (let i = 0; i < vertsPerStrip; i++) idx[ii++] = base + i;
      base += vertsPerStrip;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = aloc(gl, program, 'aPos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 8, 0);

    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    return { vao, indexCount: ii };
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function angleToDirYDown(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return [Math.cos(rad), Math.sin(rad)];
  }

  function computeDirRange(dirX, dirY) {
    const t00 = 0 * dirX + 0 * dirY;
    const t10 = 1 * dirX + 0 * dirY;
    const t01 = 0 * dirX + 1 * dirY;
    const t11 = 1 * dirX + 1 * dirY;
    const tMin = Math.min(t00, t10, t01, t11);
    const tMax = Math.max(t00, t10, t01, t11);
    return { tMin, tSpan: Math.max(1e-6, tMax - tMin) };
  }

  function toRgb01(rgb) {
    return [
      clamp01((rgb[0] || 0) / 255),
      clamp01((rgb[1] || 0) / 255),
      clamp01((rgb[2] || 0) / 255),
    ];
  }

  function resolveBackgroundGradient(settings) {
    const presets = window.BG_GRADIENT_PRESETS || {};
    const selectedKey = String(settings.gradientPreset || 'default');
    const selected = presets[selectedKey];

    if (selected && !selected.legacy && selected.colorStart && selected.colorEnd) {
      const dir = angleToDirYDown(selected.angleDeg || 0);
      const range = computeDirRange(dir[0], dir[1]);
      return {
        startRgb: toRgb01(selected.colorStart),
        endRgb: toRgb01(selected.colorEnd),
        dir,
        tMin: range.tMin,
        tSpan: range.tSpan,
      };
    }

    const cr = settings.colorR / 255;
    const cg = settings.colorG / 255;
    const cb = settings.colorB / 255;
    const top = [cr * settings.gradientTopMul, cg * settings.gradientTopMul, cb * settings.gradientTopMul * 1.2];
    const bot = [cr * settings.gradientBotMul, cg * settings.gradientBotMul, cb * settings.gradientBotMul];
    const dir = [0, 1];
    const range = computeDirRange(dir[0], dir[1]);
    return {
      startRgb: top,
      endRgb: bot,
      dir,
      tMin: range.tMin,
      tSpan: range.tSpan,
    };
  }

  window.createSplineLayer = function createSplineLayer(gl, canvas) {
    const settings = window.SPLINE_SETTINGS;
    if (!settings) throw new Error('Missing SPLINE_SETTINGS');
    if (!window.PS3SplineReverse) throw new Error('Missing PS3SplineReverse');

    const bgProg = link(
      gl,
      `#version 300 es
       precision highp float;
       in vec2 aPos;
       out vec2 vUvYDown;
       void main() {
         vUvYDown = vec2(aPos.x * 0.5 + 0.5, 1.0 - (aPos.y * 0.5 + 0.5));
         gl_Position = vec4(aPos, 0.0, 1.0);
       }`,
      `#version 300 es
       precision highp float;
       in vec2 vUvYDown;
       out vec4 oColor;
       uniform vec3 uColorStart;
       uniform vec3 uColorEnd;
       uniform vec2 uDir;
       uniform float uTMin;
       uniform float uTSpan;
       void main() {
         float t = dot(vUvYDown, uDir);
         float u = clamp((t - uTMin) / max(uTSpan, 1e-6), 0.0, 1.0);
         float g = u * u * (3.0 - 2.0 * u);
         oColor = vec4(mix(uColorStart, uColorEnd, g), 1.0);
       }`
    );

    const waveProg = link(
      gl,
      `#version 300 es
       precision highp float;
       in vec2 aPos;
       uniform sampler2D uSplineTex;
       uniform float uTime;
       uniform float flowSpeed;
       uniform float tension;
       uniform float damping;
       uniform float length;
       uniform float spacing;
       uniform float perturbation;
       uniform float perturbationScale;
       uniform float timeStep;
       uniform float waveCosAmp;
       uniform float waveBias;
       uniform float waveHeightScale;
       uniform float waveSoftClip;
       uniform float ffdYAmp;
       uniform float ffdZAmp;
       uniform float zDetailScale;
       uniform vec3 ffdScale1;
       uniform vec3 ffdScale2;
       uniform vec3 ffdOffset;
       out vec3 vPos;
       void main() {
         vec3 p = vec3(aPos.x, 0.0, aPos.y);
         vec2 uv = (aPos + 1.0) * 0.5;
         p.y = texture(uSplineTex, uv).r;
         vec3 ffd1 = p * ffdScale1 + ffdOffset;
         vec3 ffd2 = p * ffdScale2 + ffdOffset;
         p.y += sin(ffd1.x + uTime * flowSpeed) * ffdYAmp;
         p.z += cos(ffd2.z + uTime * flowSpeed) * ffdZAmp;
         float baseWave = cos(p.x * 2.0 - uTime * 0.5 * timeStep) * waveCosAmp + waveBias;
         baseWave *= (1.0 - damping);
         baseWave += tension * sin(p.x * length + uTime * flowSpeed * timeStep * 0.25);
         float structured = perturbation * perturbationScale * (
           sin((p.x * length * 6.0 + p.z * 0.5) * spacing * 0.01 + uTime * flowSpeed * timeStep * 0.7) * 0.5 +
           sin((p.x * length * 10.0 - p.z * 0.8) * spacing * 0.005 - uTime * flowSpeed * timeStep * 0.35) * 0.25
         );
         float totalWave = (baseWave + structured) * waveHeightScale;
         totalWave = waveSoftClip * tanh(totalWave / max(waveSoftClip, 1e-4));
         p.y -= totalWave;
         vec2 uv2 = uv;
         uv2.x = fract(uv2.x - uTime * flowSpeed * 0.04 * timeStep);
         p.z -= texture(uSplineTex, uv2).r * zDetailScale;
         gl_Position = vec4(p, 1.0);
         vPos = p;
       }`,
      `#version 300 es
       precision highp float;
       in vec3 vPos;
       out vec4 oColor;
       uniform float opacity;
       uniform float brightness;
       uniform float fresnelPower;
       uniform float fresnelScale;
       void main() {
         vec3 dx = dFdx(vPos);
         vec3 dy = dFdy(vPos);
         vec3 N = normalize(cross(dx, dy));
         float F = fresnelScale * pow(1.0 + dot(vec3(0.0, 0.0, -1.0), N), fresnelPower);
         oColor = vec4(vec3(1.0), F * opacity * brightness);
       }`
    );

    const bgVAO = createFullscreenQuad(gl, bgProg);
    const grid = createGrid(gl, waveProg, 100);

    const STEX_W = 256;
    const STEX_H = 64;
    const splineData = new Float32Array(STEX_W * STEX_H);
    const splineTex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, splineTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, STEX_W, STEX_H, 0, gl.RED, gl.FLOAT, splineData);

    const reversePipeline = window.PS3SplineReverse.createPipeline();

    const bgU = {
      colorStart: uloc(gl, bgProg, 'uColorStart'),
      colorEnd: uloc(gl, bgProg, 'uColorEnd'),
      dir: uloc(gl, bgProg, 'uDir'),
      tMin: uloc(gl, bgProg, 'uTMin'),
      tSpan: uloc(gl, bgProg, 'uTSpan'),
    };

    const waveU = {
      tex: uloc(gl, waveProg, 'uSplineTex'),
      time: uloc(gl, waveProg, 'uTime'),
      flowSpeed: uloc(gl, waveProg, 'flowSpeed'),
      tension: uloc(gl, waveProg, 'tension'),
      damping: uloc(gl, waveProg, 'damping'),
      length: uloc(gl, waveProg, 'length'),
      spacing: uloc(gl, waveProg, 'spacing'),
      perturbation: uloc(gl, waveProg, 'perturbation'),
      perturbationScale: uloc(gl, waveProg, 'perturbationScale'),
      timeStep: uloc(gl, waveProg, 'timeStep'),
      waveCosAmp: uloc(gl, waveProg, 'waveCosAmp'),
      waveBias: uloc(gl, waveProg, 'waveBias'),
      waveHeightScale: uloc(gl, waveProg, 'waveHeightScale'),
      waveSoftClip: uloc(gl, waveProg, 'waveSoftClip'),
      ffdScale1: uloc(gl, waveProg, 'ffdScale1'),
      ffdScale2: uloc(gl, waveProg, 'ffdScale2'),
      ffdOffset: uloc(gl, waveProg, 'ffdOffset'),
      ffdYAmp: uloc(gl, waveProg, 'ffdYAmp'),
      ffdZAmp: uloc(gl, waveProg, 'ffdZAmp'),
      zDetailScale: uloc(gl, waveProg, 'zDetailScale'),
      opacity: uloc(gl, waveProg, 'opacity'),
      brightness: uloc(gl, waveProg, 'brightness'),
      fresnelPower: uloc(gl, waveProg, 'fresnelPower'),
      fresnelScale: uloc(gl, waveProg, 'fresnelScale'),
    };

    function updateSplineTexture(timeSec) {
      const state = reversePipeline.writeDisplacementTexture(settings, timeSec, splineData, STEX_W, STEX_H);
      gl.bindTexture(gl.TEXTURE_2D, splineTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, STEX_W, STEX_H, gl.RED, gl.FLOAT, splineData);
      window.__PS3_REVERSE_STATE = state;
    }

    function render(timeSec) {
      updateSplineTexture(timeSec);
      const bgGradient = resolveBackgroundGradient(settings);

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      gl.useProgram(bgProg);
      gl.bindVertexArray(bgVAO);
      gl.uniform3f(bgU.colorStart, bgGradient.startRgb[0], bgGradient.startRgb[1], bgGradient.startRgb[2]);
      gl.uniform3f(bgU.colorEnd, bgGradient.endRgb[0], bgGradient.endRgb[1], bgGradient.endRgb[2]);
      gl.uniform2f(bgU.dir, bgGradient.dir[0], bgGradient.dir[1]);
      gl.uniform1f(bgU.tMin, bgGradient.tMin);
      gl.uniform1f(bgU.tSpan, bgGradient.tSpan);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(waveProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, splineTex);
      gl.uniform1i(waveU.tex, 0);

      gl.uniform1f(waveU.time, timeSec);
      gl.uniform1f(waveU.flowSpeed, settings.flowSpeed);
      gl.uniform1f(waveU.tension, settings.tension);
      gl.uniform1f(waveU.damping, settings.damping);
      gl.uniform1f(waveU.length, settings.length);
      gl.uniform1f(waveU.spacing, settings.spacing);
      gl.uniform1f(waveU.perturbation, settings.perturbation);
      gl.uniform1f(waveU.perturbationScale, settings.perturbationScale);
      gl.uniform1f(waveU.timeStep, settings.timeStep);
      gl.uniform1f(waveU.waveCosAmp, settings.waveCosAmp);
      gl.uniform1f(waveU.waveBias, settings.waveBias);
      gl.uniform1f(waveU.waveHeightScale, settings.waveHeightScale);
      gl.uniform1f(waveU.waveSoftClip, settings.waveSoftClip);
      gl.uniform3f(waveU.ffdScale1, settings.ffdScale1X, settings.ffdScale1Y, settings.ffdScale1Z);
      gl.uniform3f(waveU.ffdScale2, settings.ffdScale2X, settings.ffdScale2Y, settings.ffdScale2Z);
      gl.uniform3f(waveU.ffdOffset, settings.ffdOffsetX, settings.ffdOffsetY, settings.ffdOffsetZ);
      gl.uniform1f(waveU.ffdYAmp, settings.ffdYAmp);
      gl.uniform1f(waveU.ffdZAmp, settings.ffdZAmp);
      gl.uniform1f(waveU.zDetailScale, settings.zDetailScale);
      gl.uniform1f(waveU.opacity, settings.opacity);
      gl.uniform1f(waveU.brightness, settings.brightness);
      gl.uniform1f(waveU.fresnelPower, settings.fresnelPower);
      gl.uniform1f(waveU.fresnelScale, settings.fresnelScale);

      gl.bindVertexArray(grid.vao);
      gl.drawElements(gl.TRIANGLE_STRIP, grid.indexCount, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
    }

    return { render };
  };
})();
