/* @layer shared-asset-extraction @kind logic */
import { snesToRgba, TRANSPARENT } from '../../graphics/palette';
import type { SpriteSource } from '../sources';
import { HUD_PALETTE_WORDS } from './hud-decoder.constants';
import type { RGBA } from '../../graphics/palette';

const loadHudPalette = (source: SpriteSource): Map<number, RGBA> => {
  const words = source.readPaletteWords('hud', 0, HUD_PALETTE_WORDS);
  const palette = new Map<number, RGBA>();
  for (const [key, w] of words.entries()) {
    palette.set(key, w === 0 ? TRANSPARENT : snesToRgba(w));
  }
  return palette;
};

export { loadHudPalette };
