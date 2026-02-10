const DDS_MAGIC = 0x20534444;
const DDPF_FOURCC = 0x00000004;

function clampByte(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function readFourCC(value) {
  const a = String.fromCharCode(value & 0xff);
  const b = String.fromCharCode((value >> 8) & 0xff);
  const c = String.fromCharCode((value >> 16) & 0xff);
  const d = String.fromCharCode((value >> 24) & 0xff);
  return `${a}${b}${c}${d}`;
}

function trailingZeros(mask) {
  let shift = 0;
  let m = mask >>> 0;
  while (m !== 0 && (m & 1) === 0) {
    m >>>= 1;
    shift++;
  }
  return shift;
}

function bitCount(mask) {
  let m = mask >>> 0;
  let c = 0;
  while (m) {
    c += m & 1;
    m >>>= 1;
  }
  return c;
}

function extractMaskedChannel(pixelValue, mask, defaultValue) {
  if (!mask) return defaultValue;
  const shift = trailingZeros(mask);
  const bits = bitCount(mask);
  const max = (1 << bits) - 1;
  const raw = (pixelValue & mask) >>> shift;
  return max > 0 ? (raw / max) * 255 : defaultValue;
}

function decode565(v) {
  const r = ((v >> 11) & 0x1f) * 255 / 31;
  const g = ((v >> 5) & 0x3f) * 255 / 63;
  const b = (v & 0x1f) * 255 / 31;
  return [r, g, b];
}

function setRgba(out, pxIndex, rgba) {
  const o = pxIndex * 4;
  out[o] = clampByte(rgba[0]);
  out[o + 1] = clampByte(rgba[1]);
  out[o + 2] = clampByte(rgba[2]);
  out[o + 3] = clampByte(rgba[3]);
}

function decodeDxt1(view, dataOffset, width, height) {
  const out = new Uint8ClampedArray(width * height * 4);
  const bw = Math.ceil(width / 4);
  const bh = Math.ceil(height / 4);
  let ptr = dataOffset;

  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      const c0 = view.getUint16(ptr, true);
      const c1 = view.getUint16(ptr + 2, true);
      const code = view.getUint32(ptr + 4, true);
      ptr += 8;

      const p0 = decode565(c0);
      const p1 = decode565(c1);
      const palette = [
        [p0[0], p0[1], p0[2], 255],
        [p1[0], p1[1], p1[2], 255],
        [0, 0, 0, 255],
        [0, 0, 0, 255],
      ];

      if (c0 > c1) {
        palette[2] = [
          (2 * p0[0] + p1[0]) / 3,
          (2 * p0[1] + p1[1]) / 3,
          (2 * p0[2] + p1[2]) / 3,
          255,
        ];
        palette[3] = [
          (p0[0] + 2 * p1[0]) / 3,
          (p0[1] + 2 * p1[1]) / 3,
          (p0[2] + 2 * p1[2]) / 3,
          255,
        ];
      } else {
        palette[2] = [
          (p0[0] + p1[0]) / 2,
          (p0[1] + p1[1]) / 2,
          (p0[2] + p1[2]) / 2,
          255,
        ];
        palette[3] = [0, 0, 0, 0];
      }

      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px;
          const y = by * 4 + py;
          if (x >= width || y >= height) continue;
          const pi = py * 4 + px;
          const ci = (code >> (pi * 2)) & 0x03;
          setRgba(out, y * width + x, palette[ci]);
        }
      }
    }
  }
  return out;
}

function decodeDxt3(view, dataOffset, width, height) {
  const out = new Uint8ClampedArray(width * height * 4);
  const bw = Math.ceil(width / 4);
  const bh = Math.ceil(height / 4);
  let ptr = dataOffset;

  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      const a0 = view.getUint32(ptr, true);
      const a1 = view.getUint32(ptr + 4, true);
      const c0 = view.getUint16(ptr + 8, true);
      const c1 = view.getUint16(ptr + 10, true);
      const code = view.getUint32(ptr + 12, true);
      ptr += 16;

      const p0 = decode565(c0);
      const p1 = decode565(c1);
      const palette = [
        [p0[0], p0[1], p0[2]],
        [p1[0], p1[1], p1[2]],
        [(2 * p0[0] + p1[0]) / 3, (2 * p0[1] + p1[1]) / 3, (2 * p0[2] + p1[2]) / 3],
        [(p0[0] + 2 * p1[0]) / 3, (p0[1] + 2 * p1[1]) / 3, (p0[2] + 2 * p1[2]) / 3],
      ];

      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px;
          const y = by * 4 + py;
          if (x >= width || y >= height) continue;

          const pi = py * 4 + px;
          const ci = (code >> (pi * 2)) & 0x03;
          const nibbleShift = pi * 4;
          const alphaNibble = nibbleShift < 32
            ? (a0 >> nibbleShift) & 0x0f
            : (a1 >> (nibbleShift - 32)) & 0x0f;
          const alpha = alphaNibble * 17;
          const rgb = palette[ci];
          setRgba(out, y * width + x, [rgb[0], rgb[1], rgb[2], alpha]);
        }
      }
    }
  }
  return out;
}

function decodeDxt5(view, dataOffset, width, height) {
  const out = new Uint8ClampedArray(width * height * 4);
  const bw = Math.ceil(width / 4);
  const bh = Math.ceil(height / 4);
  let ptr = dataOffset;

  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      const alpha0 = view.getUint8(ptr);
      const alpha1 = view.getUint8(ptr + 1);
      const alphaBits = [];
      for (let i = 0; i < 6; i++) alphaBits.push(view.getUint8(ptr + 2 + i));

      const c0 = view.getUint16(ptr + 8, true);
      const c1 = view.getUint16(ptr + 10, true);
      const code = view.getUint32(ptr + 12, true);
      ptr += 16;

      const alphaPalette = new Array(8);
      alphaPalette[0] = alpha0;
      alphaPalette[1] = alpha1;
      if (alpha0 > alpha1) {
        alphaPalette[2] = (6 * alpha0 + alpha1) / 7;
        alphaPalette[3] = (5 * alpha0 + 2 * alpha1) / 7;
        alphaPalette[4] = (4 * alpha0 + 3 * alpha1) / 7;
        alphaPalette[5] = (3 * alpha0 + 4 * alpha1) / 7;
        alphaPalette[6] = (2 * alpha0 + 5 * alpha1) / 7;
        alphaPalette[7] = (alpha0 + 6 * alpha1) / 7;
      } else {
        alphaPalette[2] = (4 * alpha0 + alpha1) / 5;
        alphaPalette[3] = (3 * alpha0 + 2 * alpha1) / 5;
        alphaPalette[4] = (2 * alpha0 + 3 * alpha1) / 5;
        alphaPalette[5] = (alpha0 + 4 * alpha1) / 5;
        alphaPalette[6] = 0;
        alphaPalette[7] = 255;
      }

      let alphaCode = 0n;
      for (let i = 0; i < 6; i++) {
        alphaCode |= BigInt(alphaBits[i]) << BigInt(i * 8);
      }

      const p0 = decode565(c0);
      const p1 = decode565(c1);
      const palette = [
        [p0[0], p0[1], p0[2]],
        [p1[0], p1[1], p1[2]],
        [(2 * p0[0] + p1[0]) / 3, (2 * p0[1] + p1[1]) / 3, (2 * p0[2] + p1[2]) / 3],
        [(p0[0] + 2 * p1[0]) / 3, (p0[1] + 2 * p1[1]) / 3, (p0[2] + 2 * p1[2]) / 3],
      ];

      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px;
          const y = by * 4 + py;
          if (x >= width || y >= height) continue;

          const pi = py * 4 + px;
          const ci = (code >> (pi * 2)) & 0x03;
          const ai = Number((alphaCode >> BigInt(pi * 3)) & 0x07n);
          const rgb = palette[ci];
          setRgba(out, y * width + x, [rgb[0], rgb[1], rgb[2], alphaPalette[ai]]);
        }
      }
    }
  }
  return out;
}

function decodeUncompressed(view, dataOffset, width, height, rgbBitCount, rMask, gMask, bMask, aMask) {
  const out = new Uint8ClampedArray(width * height * 4);
  const bpp = rgbBitCount / 8;
  if (![3, 4].includes(bpp)) throw new Error(`Unsupported uncompressed pixel size: ${bpp} bytes`);

  const total = width * height;
  let ptr = dataOffset;
  for (let i = 0; i < total; i++) {
    let px = 0;
    if (bpp === 4) {
      px = view.getUint32(ptr, true);
    } else {
      px = view.getUint8(ptr) | (view.getUint8(ptr + 1) << 8) | (view.getUint8(ptr + 2) << 16);
    }
    ptr += bpp;

    out[i * 4] = clampByte(extractMaskedChannel(px, rMask, 0));
    out[i * 4 + 1] = clampByte(extractMaskedChannel(px, gMask, 0));
    out[i * 4 + 2] = clampByte(extractMaskedChannel(px, bMask, 0));
    out[i * 4 + 3] = clampByte(extractMaskedChannel(px, aMask, 255));
  }
  return out;
}

export function parseDds(arrayBuffer, name = "unknown.dds") {
  const view = new DataView(arrayBuffer);
  if (view.byteLength < 128) throw new Error("DDS file too small");

  const magic = view.getUint32(0, true);
  if (magic !== DDS_MAGIC) throw new Error("Not a DDS file (magic mismatch)");

  const width = view.getUint32(16, true);
  const height = view.getUint32(12, true);
  const pfFlags = view.getUint32(80, true);
  const fourCCValue = view.getUint32(84, true);
  const rgbBitCount = view.getUint32(88, true);
  const rMask = view.getUint32(92, true);
  const gMask = view.getUint32(96, true);
  const bMask = view.getUint32(100, true);
  const aMask = view.getUint32(104, true);
  const dataOffset = 128;

  if (width < 1 || height < 1) throw new Error("Invalid DDS dimensions");

  let format = "UNKNOWN";
  let pixels;
  if (pfFlags & DDPF_FOURCC) {
    const fourCC = readFourCC(fourCCValue);
    format = fourCC;
    if (fourCC === "DXT1") {
      pixels = decodeDxt1(view, dataOffset, width, height);
    } else if (fourCC === "DXT3") {
      pixels = decodeDxt3(view, dataOffset, width, height);
    } else if (fourCC === "DXT5") {
      pixels = decodeDxt5(view, dataOffset, width, height);
    } else {
      throw new Error(`Unsupported DDS FourCC: ${fourCC}`);
    }
  } else {
    format = `RGB${rgbBitCount}`;
    pixels = decodeUncompressed(view, dataOffset, width, height, rgbBitCount, rMask, gMask, bMask, aMask);
  }

  return {
    name,
    width,
    height,
    format,
    pixels,
    meta: { rgbBitCount, rMask, gMask, bMask, aMask },
  };
}

export async function readDdsFile(file) {
  const buffer = await file.arrayBuffer();
  return parseDds(buffer, file.name);
}
