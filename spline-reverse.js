'use strict';
// Reverse-engineered displacement pipeline: synthesizes PS3-like spline control behavior into a float texture.
// Exported as `window.PS3SplineReverse`; `spline.js` pulls this per frame to generate wave height/detail input data.

(function () {
  const PS3 = {
    B300_SIZE_BYTES: 0x40,
    B380_SIZE_BYTES: 0x2200,
    TABLE_ENTRY_COUNT: 0x169,
    OUTPUT_STRIDE_BYTES: 0x400,
    LOOP_ITERS: 8,
    STORE_OFFSETS_BYTES: [0x000, 0x100, 0x200, 0x300, 0x010, 0x110, 0x210, 0x310],
    STRIDE_FLOATS: 0x400 >> 2,
  };

  const NORM_A = new Float32Array([0.39584, -0.0052389996, -0.58664495, 0.189007]);
  const NORM_B = new Float32Array([-0.003751, -0.57536095, 0.161975, 0.417137]);
  const R37_WORDS = [0x00, 0x11, 0x22, 0x33];

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function fract(v) { return v - Math.floor(v); }
  function hash01(x) { return fract(Math.sin(x) * 43758.5453123); }

  function bsplineBasis(t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return [
      (1 - 3 * t + 3 * t2 - t3) / 6,
      (4 - 6 * t2 + 3 * t3) / 6,
      (1 + 3 * t + 3 * t2 - 3 * t3) / 6,
      t3 / 6,
    ];
  }

  function evalSpline(cp, u) {
    const n = cp.length - 3;
    if (n < 1) return 0;
    const s = Math.max(0, Math.min(u * n, n - 1e-6));
    const seg = Math.floor(s);
    const t = s - seg;
    const b = bsplineBasis(t);
    return b[0] * cp[seg] + b[1] * cp[seg + 1] + b[2] * cp[seg + 2] + b[3] * cp[seg + 3];
  }

  function tableIndexFromWord(word) {
    const hi = (word >> 4) & 0xff;
    const lo = word & 0xf;
    return (19 * hi + lo) % PS3.TABLE_ENTRY_COUNT;
  }

  function wrapIndexFloat(v, len) {
    let out = v % len;
    if (out < 0) out += len;
    return out;
  }

  function sampleTableVec4(table, idxFloat, out) {
    const len = PS3.TABLE_ENTRY_COUNT;
    const i0 = Math.floor(idxFloat) % len;
    const i1 = (i0 + 1) % len;
    const t = idxFloat - Math.floor(idxFloat);
    const b0 = i0 * 4;
    const b1 = i1 * 4;
    out[0] = table[b0] * (1 - t) + table[b1] * t;
    out[1] = table[b0 + 1] * (1 - t) + table[b1 + 1] * t;
    out[2] = table[b0 + 2] * (1 - t) + table[b1 + 2] * t;
    out[3] = table[b0 + 3] * (1 - t) + table[b1 + 3] * t;
  }

  function vec4Set(out, base, x, y, z, w) {
    out[base] = x;
    out[base + 1] = y;
    out[base + 2] = z;
    out[base + 3] = w;
  }

  function vec4Mix(a, b, t, out) {
    const s = 1 - t;
    out[0] = a[0] * s + b[0] * t;
    out[1] = a[1] * s + b[1] * t;
    out[2] = a[2] * s + b[2] * t;
    out[3] = a[3] * s + b[3] * t;
  }

  class SyntheticDescriptorSource {
    constructor() {
      this.lastSeed = 0;
      this.cached = new Uint8Array(PS3.B380_SIZE_BYTES);
    }

    buildB380(settings) {
      const seed = settings.reSyntheticDescriptorSeed | 0;
      if (seed === this.lastSeed) return this.cached;
      this.lastSeed = seed;

      const out = this.cached;
      const len = out.length;
      for (let i = 0; i < len; i++) {
        const f = i / len;
        const wave =
          Math.sin((f * 97.0) * (0.3 + settings.length)) * 0.5 +
          Math.sin((f * 211.0) * (0.15 + settings.tension * 3.0)) * 0.3 +
          Math.sin((f * 17.0) * (0.2 + settings.perturbationScale * 2.0)) * 0.2;
        const noise = hash01(i * 13.37 + seed * 0.01) * 2.0 - 1.0;
        const v = clamp01((wave * settings.reDescriptorStrength + noise * 0.35 + 1.0) * 0.5);
        out[i] = (v * 255) | 0;
      }
      return out;
    }

    decodeCoefficients(b380, settings, timeSec, coeffOut) {
      const len = b380.length;
      const stride = 0x130;
      const phase = timeSec * settings.flowSpeed * settings.timeStep * settings.reSyntheticDescriptorMotion;

      for (let entry = 0; entry < PS3.TABLE_ENTRY_COUNT; entry++) {
        const entryBase = entry * 16;
        const descBase = (entry * stride) % len;

        for (let blk = 0; blk < 4; blk++) {
          for (let lane = 0; lane < 4; lane++) {
            const byteIdx = (descBase + blk * 0x10 + lane * 4 + (entry % 7)) % len;
            const b = b380[byteIdx] / 255;
            const centered = b * 2 - 1;
            const harmonic = Math.sin(entry * 0.07 + blk * 0.91 + lane * 1.37 + phase * 0.23);
            coeffOut[entryBase + blk * 4 + lane] = centered * 0.75 + harmonic * 0.25;
          }
        }
      }
    }
  }

  class PS3SplineReversePipeline {
    constructor() {
      this.source = new SyntheticDescriptorSource();
      this.b300 = new Float32Array(16);
      this.coeffs = new Float32Array(PS3.TABLE_ENTRY_COUNT * 16);
      this.table = new Float32Array(PS3.TABLE_ENTRY_COUNT * 4);
      this.kernel = new Float32Array(PS3.LOOP_ITERS * PS3.STRIDE_FLOATS);
      this.kernelPacked = new Float32Array(PS3.LOOP_ITERS * 8 * 4);
      this.kernelPackedPrev = new Float32Array(PS3.LOOP_ITERS * 8 * 4);
      this.controlPoints = new Float32Array(28);
      this.debug = { lastIndices: new Uint16Array(PS3.LOOP_ITERS * 4) };
    }

    buildRuntimeInputs(settings) {
      this.b300[0] = settings.damping;
      this.b300[1] = settings.length;
      this.b300[2] = settings.tension;
      this.b300[3] = settings.spacing * 0.001;
      this.b300[4] = settings.waveCosAmp;
      this.b300[5] = settings.waveBias;
      this.b300[6] = settings.timeStep;
      this.b300[7] = settings.perturbation;
      this.b300[8] = settings.perturbationScale;
      this.b300[9] = settings.flowSpeed;
      this.b300[10] = settings.ffdScale1X;
      this.b300[11] = settings.ffdScale2X;
      this.b300[12] = settings.ffdOffsetY;
      this.b300[13] = settings.fresnelScale;
      this.b300[14] = settings.waveHeightScale;
      this.b300[15] = 1.0;

      return { b300: this.b300, b380: this.source.buildB380(settings) };
    }

    buildSplineTable(runtime, settings, timeSec) {
      this.source.decodeCoefficients(runtime.b380, settings, timeSec, this.coeffs);
      const normalizeGain = settings.reNormalizeGain;

      for (let i = 0; i < PS3.TABLE_ENTRY_COUNT; i++) {
        const cBase = i * 16;
        const tBase = i * 4;

        for (let lane = 0; lane < 4; lane++) {
          const raw =
            this.coeffs[cBase + lane] * runtime.b300[0] +
            this.coeffs[cBase + 4 + lane] * runtime.b300[1] +
            this.coeffs[cBase + 8 + lane] * runtime.b300[2] +
            this.coeffs[cBase + 12 + lane] * runtime.b300[3];

          const denomAbs = Math.max(Math.abs(NORM_B[lane]), 0.05);
          const denom = NORM_B[lane] < 0 ? -denomAbs : denomAbs;
          const norm = ((raw - NORM_A[lane]) / denom) * normalizeGain;
          this.table[tBase + lane] = Math.tanh(norm);
        }
      }
      return this.table;
    }

    runKernel(table, settings, timeSec) {
      this.kernel.fill(0);

      for (let iter = 0; iter < PS3.LOOP_ITERS; iter++) {
        const blockBaseFloats = iter * PS3.STRIDE_FLOATS;
        const phase = timeSec * settings.reKernelPhaseStep + iter * 0.37;

        const idxFloat = [0, 0, 0, 0];
        for (let lane = 0; lane < 4; lane++) {
          const baseWord = (R37_WORDS[lane] + iter * 0x13) & 0xff;
          const baseIdx = tableIndexFromWord(baseWord);
          const smoothOffset = Math.sin(phase + lane * 0.77) * settings.reIndexJitter * PS3.TABLE_ENTRY_COUNT;
          idxFloat[lane] = wrapIndexFloat(baseIdx + smoothOffset, PS3.TABLE_ENTRY_COUNT);
          this.debug.lastIndices[iter * 4 + lane] = Math.round(idxFloat[lane]) % PS3.TABLE_ENTRY_COUNT;
        }

        const v0 = new Float32Array(4);
        const v1 = new Float32Array(4);
        const v2 = new Float32Array(4);
        const v3 = new Float32Array(4);
        sampleTableVec4(table, idxFloat[0], v0);
        sampleTableVec4(table, idxFloat[1], v1);
        sampleTableVec4(table, idxFloat[2], v2);
        sampleTableVec4(table, idxFloat[3], v3);

        const mixA = 0.5 + 0.5 * Math.sin(phase * 0.7);
        const mixB = 0.5 + 0.5 * Math.cos(phase * 0.9);

        const r12 = new Float32Array(4);
        const r13 = new Float32Array(4);
        const r14 = new Float32Array(4);
        const r15 = new Float32Array(4);
        const r9 = new Float32Array(4);
        const r4 = new Float32Array(4);
        const r87 = new Float32Array(4);
        const r89 = new Float32Array(4);

        vec4Mix(v0, v1, mixA, r12);
        vec4Mix(v1, v2, mixB, r13);
        vec4Mix(v2, v3, mixA, r14);
        vec4Mix(v3, v0, mixB, r15);

        for (let lane = 0; lane < 4; lane++) {
          r9[lane] = v1[lane] - v0[lane];
          r4[lane] = v2[lane] - v1[lane];
          r87[lane] = v3[lane] - v2[lane];
          r89[lane] = v0[lane] - v3[lane];
        }

        const stores = [r12, r13, r14, r15, r9, r4, r87, r89];
        for (let s = 0; s < stores.length; s++) {
          const floatOffset = blockBaseFloats + (PS3.STORE_OFFSETS_BYTES[s] >> 2);
          const vec = stores[s];
          vec4Set(this.kernel, floatOffset, vec[0], vec[1], vec[2], vec[3]);

          const packedBase = (iter * 8 + s) * 4;
          this.kernelPacked[packedBase] = vec[0];
          this.kernelPacked[packedBase + 1] = vec[1];
          this.kernelPacked[packedBase + 2] = vec[2];
          this.kernelPacked[packedBase + 3] = vec[3];
        }
      }

      const temporal = Math.max(0, Math.min(0.999, settings.reTemporalSmooth));
      for (let i = 0; i < this.kernelPacked.length; i++) {
        const smoothed = this.kernelPackedPrev[i] * temporal + this.kernelPacked[i] * (1 - temporal);
        this.kernelPacked[i] = smoothed;
        this.kernelPackedPrev[i] = smoothed;
      }

      return this.kernelPacked;
    }

    writeDisplacementTexture(settings, timeSec, outData, width, height) {
      const runtime = this.buildRuntimeInputs(settings);
      const table = this.buildSplineTable(runtime, settings, timeSec);
      const kernelPacked = this.runKernel(table, settings, timeSec);

      const cp = this.controlPoints;
      const cpCount = cp.length;
      const kernelVecCount = PS3.LOOP_ITERS * 8;
      const flow = timeSec * settings.flowSpeed * settings.timeStep;

      for (let row = 0; row < height; row++) {
        const z = (row / Math.max(1, height - 1)) * 2 - 1;
        const rowBase = row * width;
        const rowPhase = flow * 0.25 + z * 1.7;

        for (let i = 0; i < cpCount; i++) {
          const x = i / Math.max(1, cpCount - 1);
          const kvf = row * 0.93 + i * 0.61 + flow * 0.35;
          const kv0 = ((Math.floor(kvf) % kernelVecCount) + kernelVecCount) % kernelVecCount;
          const kv1 = (kv0 + 1) % kernelVecCount;
          const kt = kvf - Math.floor(kvf);

          const k0 = kv0 * 4;
          const k1 = kv1 * 4;
          const kx = kernelPacked[k0] * (1 - kt) + kernelPacked[k1] * kt;
          const ky = kernelPacked[k0 + 1] * (1 - kt) + kernelPacked[k1 + 1] * kt;
          const kz = kernelPacked[k0 + 2] * (1 - kt) + kernelPacked[k1 + 2] * kt;
          const kw = kernelPacked[k0 + 3] * (1 - kt) + kernelPacked[k1 + 3] * kt;

          const reCore =
            (kx * 0.45 + ky * 0.25 + kz * 0.2 + kw * 0.1) * settings.reKernelGain +
            Math.sin(rowPhase + x * 6.2) * settings.bandAmplitude +
            Math.cos(z * settings.bandSecondaryFreq + x * 4.8 + flow * 0.09) * settings.bandSecondaryAmp;

          const legacy =
            Math.sin((x * Math.PI * 1.3 + z * 0.8) - flow * settings.travelSpeed1) * settings.travelAmp1 * settings.tension +
            Math.sin((x * Math.PI * 2.8 - z * 1.2) + flow * settings.travelSpeed2) * settings.travelAmp2 +
            settings.perturbation * settings.perturbationScale *
              Math.sin((x * (4.0 + settings.length * 2.0) + z * 4.0 - flow * 0.6) * (settings.spacing * 0.01));

          cp[i] = reCore * settings.rePipelineBlend + legacy * (1.0 - settings.rePipelineBlend);
        }

        for (let xi = 0; xi < width; xi++) {
          outData[rowBase + xi] = evalSpline(cp, xi / Math.max(1, width - 1));
        }
      }

      return {
        table: this.table,
        kernel: this.kernel,
        kernelPacked: this.kernelPacked,
        debug: this.debug,
      };
    }
  }

  window.PS3SplineReverse = {
    PS3,
    createPipeline() {
      return new PS3SplineReversePipeline();
    },
  };
})();
