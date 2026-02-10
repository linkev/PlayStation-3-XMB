'use strict';
// Particle layer renderer: compiles a point-sprite shader and draws additive sparkle particles over the spline scene.
// Uses `PARTICLE_SETTINGS` from `particles-settings.js` and is created by `index.html` alongside `createSplineLayer`.

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

  window.createParticlesLayer = function createParticlesLayer(gl, canvas) {
    const settings = window.PARTICLE_SETTINGS;
    if (!settings) throw new Error('Missing PARTICLE_SETTINGS');

    const ptProg = link(
      gl,
      `#version 300 es
       precision highp float;
       in vec3 aSeed;
       uniform float uTime;
       uniform float flowSpeed;
       uniform float ratio;
       uniform float ptSizeBase;
       uniform float ptSizeVar;
       out float vAlpha;
       void main() {
         gl_PointSize = aSeed.z * ptSizeVar + ptSizeBase;
         float time = uTime * flowSpeed;
         float x = fract(time * (aSeed.x - 0.5) / 15.0 + aSeed.y * 50.0) * 2.0 - 1.0;
         float y = sin(sign(aSeed.y) * time * (aSeed.y + 1.5) / 4.0 + aSeed.x * 100.0)
                 / ((6.0 - aSeed.x * 4.0 * aSeed.y) / ratio);
         float opVar = mix(
           sin(time * (aSeed.x + 0.5) * 12.0 + aSeed.y * 10.0),
           sin(time * (aSeed.y + 1.5) * 6.0 + aSeed.x * 4.0),
           y * 0.5 + 0.5) * aSeed.x + aSeed.y;
         vAlpha = opVar * opVar * (1.0 - fract(aSeed.x + time * 0.00285));
         gl_Position = vec4(x, y, 0.0, 1.0);
       }`,
      `#version 300 es
       precision highp float;
       in float vAlpha;
       out vec4 oColor;
       uniform float particleOpacity;
       void main() {
         vec2 c = gl_PointCoord * 2.0 - 1.0;
         float d = dot(c, c);
         if (d > 1.0) discard;
         float sparkle = (1.0 - d) * (1.0 - d);
         float a = vAlpha * particleOpacity * sparkle;
         oColor = vec4(vec3(a), 1.0);
       }`
    );

    const vao = gl.createVertexArray();
    const buf = gl.createBuffer();
    const seedLoc = aloc(gl, ptProg, 'aSeed');
    let count = 0;

    function rebuildParticles(newCount) {
      count = Math.max(1, newCount | 0);
      const seeds = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        seeds[i * 3] = Math.random();
        seeds[i * 3 + 1] = Math.random();
        seeds[i * 3 + 2] = Math.pow(Math.random(), 8) + 0.1;
      }

      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(seedLoc);
      gl.vertexAttribPointer(seedLoc, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
    }

    rebuildParticles(settings.count);

    const ptU = {
      time: uloc(gl, ptProg, 'uTime'),
      flowSpeed: uloc(gl, ptProg, 'flowSpeed'),
      ratio: uloc(gl, ptProg, 'ratio'),
      opacity: uloc(gl, ptProg, 'particleOpacity'),
      sizeBase: uloc(gl, ptProg, 'ptSizeBase'),
      sizeVar: uloc(gl, ptProg, 'ptSizeVar'),
    };

    function render(timeSec) {
      const desiredCount = Math.max(1, settings.count | 0);
      if (desiredCount !== count) rebuildParticles(desiredCount);

      const aspect = canvas.width / canvas.height;
      const flow = settings.flowSpeed;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(ptProg);
      gl.uniform1f(ptU.time, timeSec);
      gl.uniform1f(ptU.flowSpeed, flow);
      gl.uniform1f(ptU.ratio, Math.max(1.0, Math.min(aspect, 2.0)) * 0.375);
      gl.uniform1f(ptU.opacity, settings.opacity);
      gl.uniform1f(ptU.sizeBase, settings.sizeBase);
      gl.uniform1f(ptU.sizeVar, settings.sizeVar);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.bindVertexArray(null);
    }

    return { render };
  };
})();
