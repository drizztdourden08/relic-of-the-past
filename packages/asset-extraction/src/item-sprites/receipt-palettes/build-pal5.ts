/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { snesToRgba } from '../../graphics/palette';
import type { SpriteSource } from '../sources';
import type { RGBA } from '../../graphics/palette';

const buildPal5 = (source: SpriteSource, base: RGBA[], swordType: number, shieldType: number): RGBA[] => {
  const pal = [...base];
  const swordPal = source.readPaletteWords('sword', 0, 12);
  const shieldPal = source.readPaletteWords('shield', 0, 12);
  for (let i = 0; i < 3; i++) {
    pal[9 + i] = snesToRgba(itemAt(swordPal, swordType * 3 + i, 'Sword palette colour'));
  }
  for (let i = 0; i < 4; i++) {
    pal[12 + i] = snesToRgba(itemAt(shieldPal, shieldType * 4 + i, 'Shield palette colour'));
  }
  return pal;
};

export { buildPal5 };
