function formatNum(v, digits = 6) {
  const s = Number(v).toFixed(digits);
  return s.replace(/\.?0+$/, "");
}

function formatColor(rgba) {
  return `[${rgba.map((v) => Math.max(0, Math.min(255, Math.round(v)))).join(", ")}]`;
}

export function buildPresetRecord(analysis) {
  return {
    id: analysis.name.replace(/\.dds$/i, ""),
    width: analysis.width,
    height: analysis.height,
    angleDeg: Number(formatNum(analysis.model.angleDeg, 4)),
    colorStart: analysis.model.colorStart.map((v) => Math.round(v)),
    colorEnd: analysis.model.colorEnd.map((v) => Math.round(v)),
    rmse: Number(formatNum(analysis.rmse, 4)),
  };
}

export function generateGradientModule(analyses) {
  const rows = analyses
    .map((a) => buildPresetRecord(a))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => {
      return [
        `  "${p.id}": {`,
        `    width: ${p.width},`,
        `    height: ${p.height},`,
        `    angleDeg: ${formatNum(p.angleDeg, 4)},`,
        `    colorStart: ${formatColor(p.colorStart)},`,
        `    colorEnd: ${formatColor(p.colorEnd)},`,
        `    rmse: ${formatNum(p.rmse, 4)},`,
        "  },",
      ].join("\n");
    })
    .join("\n");

  return `export const DDS_GRADIENT_PRESETS = {\n${rows}\n};\n\n` +
`export function makeGradientCss(preset) {
  const a = preset.angleDeg;
  const s = preset.colorStart;
  const e = preset.colorEnd;
  return \`linear-gradient(\${a}deg, rgba(\${s[0]}, \${s[1]}, \${s[2]}, \${(s[3] / 255).toFixed(3)}) 0%, rgba(\${e[0]}, \${e[1]}, \${e[2]}, \${(e[3] / 255).toFixed(3)}) 100%)\`;
}
`;
}
