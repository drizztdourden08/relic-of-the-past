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

const loadHudPalette = (rom: RomData): Map<number, RGBA> => {
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
};

const loadHudSheets = (rom: RomData): Buffer[] => {
  const sheetIds = [106, 107, 105];
  return sheetIds.map(id =>
    decompress(kCompSpritePtrs[id], (addr) => rom.getByte(addr), false)
  );
};

const decodeHudTile = (tileId: number, sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
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
};

const extractHudStandard = (tileIds: number[], sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  const img = new ImageBuffer(16, 16);
  const positions: [number, number][] = [[0, 0], [8, 0], [0, 8], [8, 8]];
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decodeHudTile(tileIds[i], sheets, palette);
    img.paste(tile, positions[i][0], positions[i][1]);
  }
  return img;
};

const extractHudSpecial = (tileIds: number[], layout: string, sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  if (layout === '8x16-centered') {
    const img = new ImageBuffer(16, 16);
    for (let i = 0; i < tileIds.length; i++) {
      const tile = decodeHudTile(tileIds[i], sheets, palette);
      img.paste(tile, i * 8, 4);
    }
    return img;
  }
  throw new Error(`Unknown HUD special layout: ${layout}`);
};

const extractHudSingle = (tileId: number, sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  return decodeHudTile(tileId, sheets, palette);
};

const extractHudStrip = (tileIds: number[], sheets: Buffer[], palette: Map<number, RGBA>, cropWidth?: number): ImageBuffer => {
  const fullW = tileIds.length * 8;
  const img = new ImageBuffer(fullW, 8);
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decodeHudTile(tileIds[i], sheets, palette);
    img.paste(tile, i * 8, 0);
  }
  if (cropWidth && cropWidth < fullW) {
    const cropped = new ImageBuffer(cropWidth, 8);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < cropWidth; x++) {
        const srcOff = (y * fullW + x) * 4;
        const dstOff = (y * cropWidth + x) * 4;
        cropped.data[dstOff] = img.data[srcOff];
        cropped.data[dstOff + 1] = img.data[srcOff + 1];
        cropped.data[dstOff + 2] = img.data[srcOff + 2];
        cropped.data[dstOff + 3] = img.data[srcOff + 3];
      }
    }
    return cropped;
  }
  return img;
};

const extractHudVStrip = (tileIds: number[], sheets: Buffer[], palette: Map<number, RGBA>): ImageBuffer => {
  const h = tileIds.length * 8;
  const img = new ImageBuffer(8, h);
  for (let i = 0; i < tileIds.length; i++) {
    const tile = decodeHudTile(tileIds[i], sheets, palette);
    img.paste(tile, 0, i * 8);
  }
  return img;
};

export {
  decodeHudTile,
  extractHudSingle,
  extractHudSpecial,
  extractHudStandard,
  extractHudStrip,
  extractHudVStrip,
  loadHudPalette,
  loadHudSheets
};
