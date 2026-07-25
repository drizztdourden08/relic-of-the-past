/* @layer bridge-wasm @kind logic */
/**
 * ZSPR (community custom-sprite format) parsing + a small preview renderer for the sprite picker.
 * Format: "ZSPR" magic, then little-endian header fields; 0x7000 bytes of 4bpp player gfx + a palette block.
 * The core applies these the same way (see emscripten_main.c ApplyCustomLinkGraphics).
 */
import { decode4bppTile } from '@shared/asset-extraction/graphics';

interface ZsprData {
  pixels: Uint8Array; // 0x7000 bytes of 4bpp player tiles
  palette: Uint8Array; // raw SNES BGR555 palette block
}

const PLAYER_PIXELS = 0x7000;

const word = (b: Uint8Array, i: number): number => b[i] | (b[i + 1] << 8);
const dword = (b: Uint8Array, i: number): number => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24);

const isZspr = (b: Uint8Array): boolean =>
  b.length >= 27 && b[0] === 0x5a && b[1] === 0x53 && b[2] === 0x50 && b[3] === 0x52; // "ZSPR"

const parseZspr = (bytes: Uint8Array): ZsprData | null => {
  if (!isZspr(bytes)) return null;
  const pixelOffs = dword(bytes, 9);
  const pixelLen = word(bytes, 13);
  const palOffs = dword(bytes, 15);
  const palLen = word(bytes, 19);
  if (pixelLen !== PLAYER_PIXELS || pixelOffs + pixelLen > bytes.length || palOffs + palLen > bytes.length) return null;
  return { pixels: bytes.subarray(pixelOffs, pixelOffs + PLAYER_PIXELS), palette: bytes.subarray(palOffs, palOffs + palLen) };
};

// Front-facing standing pose, top-left of the sheet: 2 cols x 3 rows (16x24). The sheet is 16 tiles wide.
const PREVIEW_TILES = [0, 1, 16, 17, 32, 33];
const PREVIEW_COLS = 2;
const PREVIEW_W = PREVIEW_COLS * 8;
const PREVIEW_H = (PREVIEW_TILES.length / PREVIEW_COLS) * 8;

// A palette block holds 15 colors per outfit, for pixel indices 1–15 — index 0 is transparent and has
// no stored entry, so entry N-1 is the color for index N. The core lands these the same way: 15 words
// copied to the sprite palette's second slot onward (Palette_Load_LinkArmorAndGloves).
const snesColor = (pal: Uint8Array, idx: number): [number, number, number] => {
  const c = word(pal, (idx - 1) * 2);
  return [(c & 31) * 8, ((c >> 5) & 31) * 8, ((c >> 10) & 31) * 8];
};

/** Render the standing-pose preview to a PNG data URL, or null if the bytes aren't a valid ZSPR. */
const decodeZsprPreview = (bytes: Uint8Array): string | null => {
  const z = parseZspr(bytes);
  if (!z) return null;
  const canvas = document.createElement('canvas');
  canvas.width = PREVIEW_W;
  canvas.height = PREVIEW_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(PREVIEW_W, PREVIEW_H);
  PREVIEW_TILES.forEach((tile, slot) => {
    const px = (slot % PREVIEW_COLS) * 8;
    const py = Math.floor(slot / PREVIEW_COLS) * 8;
    const decoded = decode4bppTile(z.pixels, tile * 32); // 64 palette indices (0–15)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pi = decoded[y * 8 + x];
        const o = ((py + y) * PREVIEW_W + (px + x)) * 4;
        if (pi === 0) { img.data[o + 3] = 0; continue; } // index 0 = transparent
        const [r, g, b] = snesColor(z.palette, pi);
        img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
      }
    }
  });
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
};

export { parseZspr, decodeZsprPreview, isZspr };
export type { ZsprData };
