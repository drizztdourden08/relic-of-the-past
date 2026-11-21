/* @layer shared-asset-extraction @kind logic */
import type { SpriteSource } from '../../item-sprites/sources';
import { snesToRgba, TRANSPARENT } from '../../graphics/palette';
import { HUD_PALETTE_BLOCK, LEGEND_SHEET, SHEET_VRAM } from './extract-legend.constants';
import type { Legend } from './extract-legend.type';

const loadLegend = (source: SpriteSource): Legend => {
  const vram = new Uint16Array(0x8000);
  const sheet = source.readSheet('spr', LEGEND_SHEET);
  for (let i = 0; i < sheet.length >> 1 && i < 0x400; i += 1) vram[SHEET_VRAM + i] = (sheet[i * 2] ?? 0) | ((sheet[i * 2 + 1] ?? 0) << 8);
  const words = source.readPaletteWords('hud', HUD_PALETTE_BLOCK, 32);
  return { vram, palette: words.map((w, i) => (i % 4 === 0 ? TRANSPARENT : snesToRgba(w))) };
};

export { loadLegend };
