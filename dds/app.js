import { readDdsFile } from "./dds-reader.js";
import { analyzeLinearGradient2D, rebuildGradient } from "./gradient-fit.js";
import { generateGradientModule } from "./export-code.js";

const fileInput = document.getElementById("dds-files");
const textureSelect = document.getElementById("texture-select");
const analyzeSelectedBtn = document.getElementById("analyze-selected");
const analyzeAllBtn = document.getElementById("analyze-all");
const exportBtn = document.getElementById("export-js");
const copyBtn = document.getElementById("copy-export");
const exportOutput = document.getElementById("export-output");
const statsEl = document.getElementById("stats");
const angleStepsInput = document.getElementById("angle-steps");
const previewScaleInput = document.getElementById("preview-scale");
const originalCanvas = document.getElementById("original-canvas");
const reconCanvas = document.getElementById("recon-canvas");

const textures = [];
const analyses = new Map();

function ensureCanvasContext(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  return ctx;
}

function drawPixelsScaled(canvas, width, height, pixels, scale) {
  const ctx = ensureCanvasContext(canvas);
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const offCtx = ensureCanvasContext(off);
  offCtx.putImageData(new ImageData(pixels, width, height), 0, 0);

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}

function refreshTextureSelect() {
  textureSelect.innerHTML = "";
  textures.forEach((tex, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = `${tex.name} (${tex.width}x${tex.height}, ${tex.format})`;
    textureSelect.appendChild(opt);
  });
  if (textures.length > 0 && textureSelect.selectedIndex < 0) {
    textureSelect.selectedIndex = 0;
  }
}

function selectedTexture() {
  const idx = Number(textureSelect.value);
  if (!Number.isInteger(idx) || idx < 0 || idx >= textures.length) return null;
  return textures[idx];
}

function formatRgba(label, rgba) {
  return `${label}: [${rgba.map((v) => Math.round(v)).join(", ")}]`;
}

function showAnalysis(texture, analysis) {
  const scale = Math.max(1, Math.min(80, Number(previewScaleInput.value) || 12));
  const rebuilt = rebuildGradient(texture.width, texture.height, analysis.model);
  drawPixelsScaled(originalCanvas, texture.width, texture.height, texture.pixels, scale);
  drawPixelsScaled(reconCanvas, texture.width, texture.height, rebuilt, scale);

  statsEl.textContent = [
    `File: ${texture.name}`,
    `DDS format: ${texture.format}`,
    `Size: ${texture.width}x${texture.height}`,
    `Best direction angle (deg): ${analysis.model.angleDeg.toFixed(4)}`,
    `Direction vector: [${analysis.model.direction[0].toFixed(6)}, ${analysis.model.direction[1].toFixed(6)}]`,
    formatRgba("Start color", analysis.model.colorStart),
    formatRgba("End color", analysis.model.colorEnd),
    `RMSE: ${analysis.rmse.toFixed(5)} (lower is better)`,
  ].join("\n");
}

function analyzeOne(texture) {
  const angleSteps = Math.max(90, Math.min(2160, Number(angleStepsInput.value) || 720));
  const analysis = analyzeLinearGradient2D(texture, { angleSteps });
  analyses.set(texture.name, analysis);
  if (selectedTexture() && selectedTexture().name === texture.name) {
    showAnalysis(texture, analysis);
  }
  return analysis;
}

function showStatus(message) {
  statsEl.textContent = message;
}

async function loadFiles(files) {
  showStatus("Loading DDS files...");
  for (const file of files) {
    try {
      const tex = await readDdsFile(file);
      textures.push(tex);
    } catch (err) {
      showStatus(`Failed to parse ${file.name}: ${err.message}`);
    }
  }
  refreshTextureSelect();
  if (textures.length) {
    const tex = selectedTexture() || textures[0];
    drawPixelsScaled(
      originalCanvas,
      tex.width,
      tex.height,
      tex.pixels,
      Math.max(1, Math.min(80, Number(previewScaleInput.value) || 12))
    );
    showStatus(`Loaded ${textures.length} DDS file(s). Select one and analyze.`);
  }
}

fileInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []).filter((f) => /\.dds$/i.test(f.name));
  if (!files.length) {
    showStatus("No DDS files selected.");
    return;
  }
  await loadFiles(files);
});

textureSelect.addEventListener("change", () => {
  const tex = selectedTexture();
  if (!tex) return;
  const existing = analyses.get(tex.name);
  if (existing) {
    showAnalysis(tex, existing);
    return;
  }
  drawPixelsScaled(
    originalCanvas,
    tex.width,
    tex.height,
    tex.pixels,
    Math.max(1, Math.min(80, Number(previewScaleInput.value) || 12))
  );
  showStatus(`Selected ${tex.name}. Run analysis to solve gradient direction/colors.`);
});

analyzeSelectedBtn.addEventListener("click", () => {
  const tex = selectedTexture();
  if (!tex) {
    showStatus("Load at least one DDS file first.");
    return;
  }
  const result = analyzeOne(tex);
  showAnalysis(tex, result);
});

analyzeAllBtn.addEventListener("click", () => {
  if (!textures.length) {
    showStatus("Load DDS files first.");
    return;
  }
  for (const tex of textures) analyzeOne(tex);
  const current = selectedTexture();
  if (current) {
    showAnalysis(current, analyses.get(current.name));
  }
  showStatus(`Analyzed ${textures.length} file(s). Export when ready.`);
});

exportBtn.addEventListener("click", () => {
  if (!analyses.size) {
    showStatus("Analyze at least one file first.");
    return;
  }
  const moduleText = generateGradientModule(Array.from(analyses.values()));
  exportOutput.value = moduleText;
  showStatus(`Export generated for ${analyses.size} gradient(s).`);
});

copyBtn.addEventListener("click", async () => {
  if (!exportOutput.value.trim()) {
    showStatus("Nothing to copy. Generate export first.");
    return;
  }
  await navigator.clipboard.writeText(exportOutput.value);
  showStatus("Export JS copied to clipboard.");
});
