/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { itemAt } from '../../checked-read';
import { ImageBuffer } from '../../graphics/png-writer';
import { applyStripes } from '../../graphics/stripe-image';
import { ADDR_LEGEND_STRIPES, BG3_CHARS, BG3_MAP, MAP_WORDS, UNWRITTEN } from './extract-legend.constants';
import type { Legend } from './extract-legend.type';

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
    const w = legend.vram[base + (flipY ? 7 - y : y)] ?? 0;
    for (let x = 0; x < 8; x += 1) {
      const bit = flipX ? x : 7 - x;
      const c = ((w >> bit) & 1) | (((w >> (bit + 8)) & 1) << 1);
      if (c !== 0) img.putPixel(at.x + x, at.y + y, itemAt(legend.palette, row * 4 + c, 'Legend palette colour'));
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
  for (const i of cells) drawCell(img, legend, vram[BG3_MAP + i] ?? 0, { x: ((i & 31) - left) * 8, y: ((i >> 5) - top) * 8 });
  return img;
};

export { extractLegend };
