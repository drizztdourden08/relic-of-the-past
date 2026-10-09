/* @layer shared-asset-extraction @kind logic */
import { snesToRgba } from '../../graphics/palette';
import { ADDR_SWORD_PALETTE, ADDR_SHIELD_PALETTE } from '../../data/constants';
import type { RomData } from '../../rom/rom-types';
import type { RGBA } from '../../graphics/palette';

const buildPal5 = (rom: RomData, base: RGBA[], swordType: number, shieldType: number): RGBA[] => {
  const pal = [...base];
  const swordPal = rom.getWords(ADDR_SWORD_PALETTE, 12);
  const shieldPal = rom.getWords(ADDR_SHIELD_PALETTE, 12);
  for (let i = 0; i < 3; i++) {
    pal[9 + i] = snesToRgba(swordPal[swordType * 3 + i]);
  }
  for (let i = 0; i < 4; i++) {
    pal[12 + i] = snesToRgba(shieldPal[shieldType * 4 + i]);
  }
  return pal;
};

export { buildPal5 };
