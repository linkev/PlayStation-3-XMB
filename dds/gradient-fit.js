function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function clampByte(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function linearRegression(samples, channelIndex, dx, dy) {
  let n = 0;
  let sumT = 0;
  let sumTT = 0;
  let sumC = 0;
  let sumTC = 0;

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const t = s.x * dx + s.y * dy;
    const c = s.rgba[channelIndex];
    n++;
    sumT += t;
    sumTT += t * t;
    sumC += c;
    sumTC += t * c;
  }

  const denom = n * sumTT - sumT * sumT;
  if (Math.abs(denom) < 1e-8) {
    return { m: 0, b: n > 0 ? sumC / n : 0 };
  }
  const m = (n * sumTC - sumT * sumC) / denom;
  const b = (sumC - m * sumT) / n;
  return { m, b };
}

function evaluateError(samples, model, dx, dy) {
  let error = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const t = s.x * dx + s.y * dy;
    for (let c = 0; c < 4; c++) {
      const predicted = model[c].m * t + model[c].b;
      const d = predicted - s.rgba[c];
      error += d * d;
    }
  }
  return error;
}

function collectSamples(image) {
  const { width, height, pixels } = image;
  const samples = new Array(width * height);
  const maxX = Math.max(1, width - 1);
  const maxY = Math.max(1, height - 1);
  let k = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      samples[k++] = {
        x: x / maxX,
        y: y / maxY,
        rgba: [pixels[p], pixels[p + 1], pixels[p + 2], pixels[p + 3]],
      };
    }
  }
  return samples;
}

export function analyzeLinearGradient2D(image, options = {}) {
  const angleSteps = Math.max(90, Math.min(2160, options.angleSteps ?? 720));
  const samples = collectSamples(image);
  const halfTurn = Math.PI;

  let best = null;
  for (let i = 0; i < angleSteps; i++) {
    const angle = (i / angleSteps) * halfTurn;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const model = [
      linearRegression(samples, 0, dx, dy),
      linearRegression(samples, 1, dx, dy),
      linearRegression(samples, 2, dx, dy),
      linearRegression(samples, 3, dx, dy),
    ];
    const error = evaluateError(samples, model, dx, dy);

    if (!best || error < best.error) {
      best = { angle, dx, dy, model, error };
    }
  }

  const corners = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];
  let tMin = Infinity;
  let tMax = -Infinity;
  for (const c of corners) {
    const t = c.x * best.dx + c.y * best.dy;
    tMin = Math.min(tMin, t);
    tMax = Math.max(tMax, t);
  }
  const tSpan = Math.max(1e-6, tMax - tMin);

  const colorStart = new Array(4);
  const colorEnd = new Array(4);
  for (let c = 0; c < 4; c++) {
    colorStart[c] = clampByte(best.model[c].m * tMin + best.model[c].b);
    colorEnd[c] = clampByte(best.model[c].m * tMax + best.model[c].b);
  }

  const mse = best.error / (samples.length * 4);
  let angleDeg = best.angle * 180 / Math.PI;
  angleDeg = (angleDeg + 360) % 360;

  return {
    width: image.width,
    height: image.height,
    format: image.format,
    name: image.name,
    model: {
      angleDeg,
      direction: [best.dx, best.dy],
      tMin,
      tMax,
      tSpan,
      colorStart,
      colorEnd,
    },
    mse,
    rmse: Math.sqrt(mse),
  };
}

export function rebuildGradient(width, height, model) {
  const out = new Uint8ClampedArray(width * height * 4);
  const maxX = Math.max(1, width - 1);
  const maxY = Math.max(1, height - 1);
  const [dx, dy] = model.direction;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / maxX;
      const ny = y / maxY;
      const t = nx * dx + ny * dy;
      const u = clamp01((t - model.tMin) / model.tSpan);
      const p = (y * width + x) * 4;
      out[p] = clampByte(lerp(model.colorStart[0], model.colorEnd[0], u));
      out[p + 1] = clampByte(lerp(model.colorStart[1], model.colorEnd[1], u));
      out[p + 2] = clampByte(lerp(model.colorStart[2], model.colorEnd[2], u));
      out[p + 3] = clampByte(lerp(model.colorStart[3], model.colorEnd[3], u));
    }
  }
  return out;
}
