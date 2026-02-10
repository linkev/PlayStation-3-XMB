// Shader Definitions Module - Optimized
// Contains all WebGL shader source code with shared functions

// Shared shader functions to avoid duplication
const SHADER_COMMON = {
  hash: `
    float hash(float n) { return fract(sin(n) * 1e4); }
    float hash(vec2 p) { return fract(1e4 * sin(17. * p.x + p.y * .1) * (.1 + abs(sin(p.y * 13. + p.x)))); }`,
  
  noise: `
    float noise(float x) {
      float i = floor(x), f = fract(x), u = f * f * (3. - 2. * f);
      return mix(hash(i), hash(i + 1.), u);
    }
    float noise(vec2 x) {
      vec2 i = floor(x), f = fract(x);
      float a = hash(i), b = hash(i + vec2(1., 0.)), c = hash(i + vec2(0., 1.)), d = hash(i + vec2(1., 1.));
      vec2 u = f * f * (3. - 2. * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
    }
    float noise(vec3 x) {
      const vec3 step = vec3(110, 241, 171);
      vec3 i = floor(x), f = fract(x);
      float n = dot(i, step);
      vec3 u = f * f * (3. - 2. * f);
      return mix(
        mix(mix(hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
            mix(hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
        mix(mix(hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
            mix(hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
    }`,
  
  xmbNoise: `float xmbNoise(vec3 x) { return cos(x.z * 4.) * cos(x.z + uTime / 10. + x.x); }`
};

export function getShaders(isWebGL2) {
  const version = isWebGL2 ? "#version 300 es\n" : "";
  const attr = isWebGL2 ? "in" : "attribute";
  const vary = isWebGL2 ? "out" : "varying";
  const varyIn = isWebGL2 ? "in" : "varying";
  const fragOut = isWebGL2 ? "out vec4 fragColor;\n" : "";
  const texture = isWebGL2 ? "" : "2D";
  const fragColor = isWebGL2 ? "fragColor" : "gl_FragColor";

  return {
    background: {
      vert: `${version}precision highp float;
        ${attr} vec2 position;
        uniform vec2 u_resolution;
        ${vary} vec2 v_pos;
        ${vary} float v_gradient;
        void main() {
          v_pos = (position + 1.0) / 2.0 * u_resolution;
          v_gradient = 1.0 - position.y * 0.625;
          gl_Position = vec4(position, 0.0, 1.0);
        }`,
      frag: `${version}precision highp float;
        uniform vec3 u_color;
        uniform sampler2D u_bayerTexture;
        ${varyIn} vec2 v_pos;
        ${varyIn} float v_gradient;
        ${fragOut}
        void main() {
          float threshold = texture${texture}(u_bayerTexture, v_pos / 8.0).a;
          vec3 diff = 1.0 - mod(v_gradient * u_color * 255.0, 1.0);
          vec3 dithered = v_gradient * u_color + diff * vec3(
            float(diff.r < threshold), float(diff.g < threshold), float(diff.b < threshold)
          ) / 255.0;
          ${fragColor} = vec4(dithered, 1.0);
        }`
    },
    flow: {
      vert: `${version}precision highp float;
        ${attr} vec2 position;
        uniform float uTime, ratio, flowSpeed, damping, tension, length, spacing, perturbation;
        uniform vec3 ffdScale1, ffdScale2, ffdOffset;
        ${vary} vec2 vUv;
        ${vary} vec3 vPosition;
        ${SHADER_COMMON.hash}
        ${SHADER_COMMON.noise}
        ${SHADER_COMMON.xmbNoise}
        void main() {
          vec3 p = vec3(position.x, 0., position.y);
          p.y = xmbNoise(p) / 8.;
          vec3 ffd1 = p * ffdScale1 + ffdOffset, ffd2 = p * ffdScale2 + ffdOffset;
          p.y += sin(ffd1.x + uTime * flowSpeed) * 0.1;
          p.z += cos(ffd2.z + uTime * flowSpeed) * 0.1;
          vec3 p2 = p;
          p2.x -= uTime * flowSpeed; p2.x /= 4.; p2.y -= uTime / 100.; p2.z -= uTime / 10.;
          float waveHeight = noise(p2 * 8.) / 12. + cos(p.x * 2. - uTime / 2.) / 5. - 0.1;
          waveHeight *= (1.0 - damping);
          waveHeight += tension * sin(p.x * length + uTime * flowSpeed) + perturbation * noise(p2 * spacing);
          p.y -= waveHeight; p.z -= noise(p2 * 8.) / 12.;
          gl_Position = vec4(p, 1.); vUv = (position + 1.) / 2.; vPosition = p;
        }`,
      frag: `${version}precision lowp float;
        uniform float opacity, brightness;
        ${varyIn} vec3 vPosition;
        ${fragOut}
        void main() {
          vec3 X = dFdx(vPosition), Y = dFdy(vPosition);
          vec3 N = normalize(cross(X, Y));
          float F = 0.5 * pow(1. + dot(vec3(0., 0., -1.), N), 4.);
          ${fragColor} = vec4(vec3(1.), F * opacity * brightness);
        }`
    },
    particle: {
      vert: `${version}precision highp float;
        ${attr} vec3 seed;
        uniform float uTime, ratio, flowSpeed, emitVelMin, emitVelMul, emitVelVar, emitConeAngle, emitNegProb;
        uniform float agingSpeed, agingVariance, friction, gravity, windScale, brownianScale;
        uniform vec3 windDir;
        ${vary} float alpha;
        ${SHADER_COMMON.hash}
        ${SHADER_COMMON.noise}
        ${SHADER_COMMON.xmbNoise}
        void main() {
          gl_PointSize = seed.z * 8. + 4.;
          float time = uTime * flowSpeed;
          float x = fract(time * (seed.x - 0.5) / 15. + seed.y * 50.) * 2. - 1.;
          float y = sin(sign(seed.y) * time * (seed.y + 1.5) / 4. + seed.x * 100.) / ((6. - seed.x * 4. * seed.y) / ratio);
          float age = fract(seed.x + time * agingSpeed * (1.0 + agingVariance * seed.y));
          float vel = emitVelMin + emitVelMul * (1.0 + emitVelVar * seed.z);
          if (seed.y < emitNegProb) vel = -vel;
          vel *= cos(emitConeAngle * 3.14159 / 180.0);
          y += vel * age + gravity * age * age;
          y *= (1.0 - friction * age);
          x += windDir.x * windScale * age + noise(vec2(x, y) * 10.0) * brownianScale;
          y += windDir.y * windScale * age + noise(vec2(x, y) * 10.0) * brownianScale;
          y += xmbNoise(vec3(x, 0., seed.y)) / 8. - noise(vec2(x - time * flowSpeed, seed.y - time / 100.) * 8.) / 12.;
          float opacityVar = mix(sin(time * (seed.x + 0.5) * 12. + seed.y * 10.), sin(time * (seed.y + 1.5) * 6. + seed.x * 4.), y * 0.5 + 0.5) * seed.x + seed.y;
          alpha = opacityVar * opacityVar * (1.0 - age);
          gl_Position = vec4(x, y, 0., 1.);
        }`,
      frag: `${version}precision lowp float;
        uniform float particleOpacity;
        ${varyIn} float alpha;
        ${fragOut}
        void main() {
          vec2 cxy = gl_PointCoord * 2. - 1.;
          float sparkle = max(0., 1. - dot(cxy, cxy));
          ${fragColor} = vec4(vec3(alpha * particleOpacity * sparkle), 1.);
        }`
    }
  };
} 