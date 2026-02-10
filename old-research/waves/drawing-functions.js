// Drawing Functions Module - Optimized
// Creates REGL drawing functions using optimized shaders

import { NUM_PARTICLES, makeParticleSeeds } from './mesh-generation.js';
import { getShaders } from './shaders.js';

export function createDrawBackground(regl, isWebGL2) {
  const shaders = getShaders(isWebGL2);
  return regl({
    ...shaders.background,
    primitive: "triangle strip",
    count: 4,
    attributes: { position: [+1, -1, -1, -1, +1, +1, -1, +1] },
    uniforms: {
      u_color: regl.prop("color"),
      u_resolution: (ctx) => [ctx.viewportWidth, ctx.viewportHeight],
      u_bayerTexture: regl.texture({
        data: new Uint8Array([0,128,32,160,8,136,40,168,192,64,224,96,200,72,232,104,48,176,16,144,56,184,24,152,240,112,208,80,248,120,216,88,12,140,44,172,4,132,36,164,204,76,236,108,196,68,228,100,60,188,28,156,52,180,20,148,252,124,220,92,244,116,212,84]),
        format: "alpha", shape: [8, 8], wrap: ["repeat", "repeat"]
      })
    },
    depth: { enable: false }
  });
}

export function createDrawFlow(regl, mesh, currentResolution, isWebGL2) {
  const shaders = getShaders(isWebGL2);
  return regl({
    ...shaders.flow,
    primitive: "triangle strip",
    elements: mesh.indices,
    attributes: { position: { buffer: regl.buffer(mesh.vertices), stride: 8, offset: 0 } },
    uniforms: {
      uTime: regl.prop("time"),
      uResolution: (ctx) => [ctx.viewportWidth, ctx.viewportHeight],
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
      ffdOffset: regl.prop("ffdOffset")
    },
    blend: { enable: true, func: { srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 'one minus src alpha', dstAlpha: 1 } },
    depth: { enable: false },
    dither: false
  });
}

export function createDrawParticles(regl, isWebGL2) {
  const shaders = getShaders(isWebGL2);
  return regl({
    ...shaders.particle,
    primitive: "points",
    count: NUM_PARTICLES,
    attributes: { seed: makeParticleSeeds() },
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
      brownianScale: regl.prop("brownianScale")
    },
    blend: { enable: true, func: { src: 1, dst: 1 } },
    depth: { enable: false },
    dither: false
  });
} 