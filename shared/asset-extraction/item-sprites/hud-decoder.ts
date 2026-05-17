/**
 * HUD tile decoder — extracts 2bpp HUD item graphics.
 *
 * HUD items use tile IDs that encode:
 * - bits [9:0] = tile number (0-1023)
 * - bits [12:10] = palette index (0-7)
 * - bit 14 = horizontal flip
 * - bit 15 = vertical flip
 *
 * Tiles are stored in 3 compressed sheets (indices 106, 107, 105).
 * Each sheet holds 128 tiles (16 bytes each in 2bpp format).
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { snesToRgba, TRANSPARENT } from '../graphics/palette';
import { decompress } from '../compression/lz-decompress';
import { kCompSpritePtrs } from '../data/tables';
import { ADDR_HUD_PALETTE } from '../data/constants';
import { ImageBuffer } from '../graphics/png-writer';

/**
 * Load HUD palettes from ROM.
 * Returns a Map keyed by (palIdx, colorIdx) → RGBA.
 */
export function loadHudPalette(rom: RomData): Map<number, RGBA> {
  const words = rom.getWords(ADDR_HUD_PALETTE, 64);
  const palette = new Map<number, RGBA>();
  for (let p = 0; p < 16; p++) {
    for (let c = 0; c < 4; c++) {
      const key = p * 4 + c;
      const w = words[p * 4 + c];
      palette.set(key, w === 0 ? TRANSPARENT : snesToRgba(w));
    }
  }
  return palette;
}

/**
 * Load raw HUD tile sheets from ROM (decompressed).
 * Returns 3 sheets in order: [sheet106, sheet107, sheet105]
 */
export function loadHudSheets(rom: RomData): Buffer[] {
  const sheetIds = [106, 107, 105];
  return sheetIds.map(id =>
    decompress(kCompSpritePtrs[id], (addr) => rom.getByte(addr), false)
  );
}

/**
 * Decode a single 8×8 HUD tile from its tile ID.
 */
export function decodeHudTile(
  tileId: number,
  sheets: Buffer[],
  palette: Map<number, RGBA>,
): ImageBuffer {
  const tileNum = tileId & 0x3ff;
  const palIdx = (tileId >>> 10) & 7;
  const flipX = !!(tileId & 0x4000);
  const flipY = !!(tileId & 0x8000);

  const sheetIdx = Math.floor(tileNum / 128);
  const localTile = tileNum % 128;
  const raw = sheets[sheetIdx];
  const offset = localTile * 16;

  const img = new ImageBuffer(8, 8);

  for (let y = 0; y < 8; y++) {
    const d0 = raw[offset + y * 2];
    const d1 = raw[offset + y * 2 + 1];
    for (let x = 0; x < 8; x++) {
      const px = ((d0 >>> x) & 1) | (((d1 >>> x) & 1) << 1);
      if (px === 0) continue;
      const color = palette.get(palIdx * 4 + px) ?? TRANSPARENT;
      img.putPixel(7 - x, y, color);
    }
  }

  let result = img;
  if (flipX) result = result.flipX();
  if (flipY) result = result.flipY();
  return result;
}

/**
 * Extract a standard 16×16 HUD sprite from 4 tile IDs (TL, TR, BL, BR).
 */
export function extractHudStandard(
  tileIds: number[],
  sheets: Buffer[],
  palette: Map<number, RGBA>,
): ImageBuffer {
  const img = new ImageBuffer(16, 16);
  const positions: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decodeHudTile(tileIds[i], sheets, palette);
    img.paste(tile, positions[i][0], positions[i][1]);
  }
  return img;
}

/**
 * Extract a special HUD sprite with custom layout.
 */
export function extractHudSpecial(
  tileIds: number[],
  layout: string,
  sheets: Buffer[],
  palette: Map<number, RGBA>,
): ImageBuffer {
  if (layout === '8x16-centered') {
    const img = new ImageBuffer(16, 16);
    for (let i = 0; i < tileIds.length; i++) {
      const tile = decodeHudTile(tileIds[i], sheets, palette);
      img.paste(tile, i * 8, 4);
    }
    return img;
  }
  throw new Error(`Unknown HUD special layout: ${layout}`);
}
