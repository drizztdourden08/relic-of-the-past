/* @layer shared-asset-extraction @kind logic */
/**
 * The four pictures of the story intro, the legend told over the polka-dot backdrop
 * before the attract sequence moves on to the world map. Each is a stripe list
 * (kAttract_Legendgraphics_0-3, stored back to back) that the NMI writes into the BG3
 * tilemap, drawn from the 2bpp sheet Attract_LoadBG3GFX uploads, on HUD palette row 5.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { snesToRgba, TRANSPARENT } from '../graphics/palette';
import { ImageBuffer } from '../graphics/png-writer';
import { applyStripes } from '../graphics/stripe-image';
import { decompress } from '../compression/lz-decompress';
import { kCompSpritePtrs } from '../data/tables';
import { ADDR_HUD_PALETTE } from '../data/constants';

const ADDR_LEGEND_STRIPES = 0x8cfac2;
const LEGEND_COUNT = 4;
/** Attract_LoadBG3GFX: sheet 0x67 copied as-is to BG3 characters 0x100-0x17f. */
const LEGEND_SHEET = 0x67;
const BG3_CHARS = 0x7000;
const BG3_MAP = 0x6000;
const SHEET_VRAM = 0x7800;
/** hud_palette 1 is the second 32-colour block of kHudPalData. */
const HUD_PALETTE_BLOCK = 32;
const MAP_WORDS = 0x400;
/** Marks the tilemap cells no stripe wrote, so the picture is cut to exactly its own cells. */
const UNWRITTEN = 0xffff;

interface Legend {
  vram: Uint16Array;
  palette: RGBA[];
}

const loadLegend = (rom: RomData): Legend => {
  const vram = new Uint16Array(0x8000);
  const sheet = decompress(kCompSpritePtrs[LEGEND_SHEET], (a) => rom.getByte(a), false);
  for (let i = 0; i < sheet.length >> 1 && i < 0x400; i += 1) vram[SHEET_VRAM + i] = sheet[i * 2] | (sheet[i * 2 + 1] << 8);
  const words = rom.getWords(ADDR_HUD_PALETTE + HUD_PALETTE_BLOCK * 2, 32);
  return { vram, palette: words.map((w, i) => (i % 4 === 0 ? TRANSPARENT : snesToRgba(w))) };
};

/** The stripe list of picture |index| (0-3): each starts where the one before ends. */
const legendStart = (rom: RomData, index: number): number => {
  let p = ADDR_LEGEND_STRIPES;
  for (let i = 0; i < index; i += 1) p = applyStripes(new Uint16Array(0x8000), rom, p);
  return p;
};

const drawCell = (img: ImageBuffer, legend: Legend, entry: number, at: { x: number; y: number }): void => {
  const base = BG3_CHARS + (entry & 0x3ff) * 8;
  const row = (entry >> 10) & 7;
  const flipX = (entry & 0x4000) !== 0, flipY = (entry & 0x8000) !== 0;
  for (let y = 0; y < 8; y += 1) {
    const w = legend.vram[base + (flipY ? 7 - y : y)];
    for (let x = 0; x < 8; x += 1) {
      const bit = flipX ? x : 7 - x;
      const c = ((w >> bit) & 1) | (((w >> (bit + 8)) & 1) << 1);
      if (c !== 0) img.putPixel(at.x + x, at.y + y, legend.palette[row * 4 + c]);
    }
  }
};

const extractLegend = (rom: RomData, legend: Legend, index: number): ImageBuffer => {
  const vram = legend.vram;
  vram.fill(UNWRITTEN, BG3_MAP, BG3_MAP + MAP_WORDS);
  applyStripes(vram, rom, legendStart(rom, index));
  const cells: number[] = [];
  for (let i = 0; i < MAP_WORDS; i += 1) if (vram[BG3_MAP + i] !== UNWRITTEN) cells.push(i);
  const cols = cells.map((i) => i & 31), rows = cells.map((i) => i >> 5);
  const left = Math.min(...cols), top = Math.min(...rows);
  const img = new ImageBuffer((Math.max(...cols) - left + 1) * 8, (Math.max(...rows) - top + 1) * 8);
  for (const i of cells) drawCell(img, legend, vram[BG3_MAP + i], { x: ((i & 31) - left) * 8, y: ((i >> 5) - top) * 8 });
  return img;
};

export { extractLegend, LEGEND_COUNT, loadLegend };
export type { Legend };
