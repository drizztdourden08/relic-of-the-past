/* @layer shared-asset-extraction @kind logic */
/** Sprite palette loading + sword/shield override for receipt sprites. */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { snesToRgba, TRANSPARENT } from '../graphics/palette';
import {
  ADDR_SPRITE_PALETTE_MAIN, ADDR_SPRITE_PALETTE_AUX1,
  ADDR_SPRITE_PALETTE_AUX3, ADDR_SWORD_PALETTE,
  ADDR_SHIELD_PALETTE, ADDR_ARMOR_PALETTE,
} from '../data/constants';

/** Sprite palette state loaded from ROM, then mutated for per-sprite overrides. */
interface SpritePalettes {
  palettes: RGBA[][];
}

const loadSpritePalettes = (rom: RomData): SpritePalettes => {
  const palettes: RGBA[][] = Array.from({ length: 8 }, () =>
    new Array(16).fill(TRANSPARENT) as RGBA[]
  );

  // Main sprite palettes (1-4): 4 × 15 colors
  const mainSpr = rom.getWords(ADDR_SPRITE_PALETTE_MAIN, 120);
  for (let p = 0; p < 4; p++) {
    for (let i = 0; i < 15; i++) {
      palettes[p + 1][i + 1] = snesToRgba(mainSpr[p * 15 + i]);
    }
  }

  // Auxiliary palette 1 (palettes 5, 6)
  const aux1 = rom.getWords(ADDR_SPRITE_PALETTE_AUX1, 168);
  for (const [sub, ai] of [[5, 0], [6, 7]] as const) {
    for (let i = 0; i < 7; i++) {
      palettes[sub][i + 1] = snesToRgba(aux1[ai * 7 + i]);
    }
  }

  // Palette 6 indices 9-15 (row 6 of kPalette_MiscSprite, the light world outdoor default)
  for (let i = 0; i < 7; i++) {
    palettes[6][i + 9] = snesToRgba(aux1[6 * 7 + i]);
  }

  // Sword palette (palette 5, indices 9-11)
  const swordPal = rom.getWords(ADDR_SWORD_PALETTE, 12);
  for (let i = 0; i < 3; i++) {
    palettes[5][9 + i] = snesToRgba(swordPal[i]);
  }

  // Shield palette (palette 5, indices 12-15)
  const shieldPal = rom.getWords(ADDR_SHIELD_PALETTE, 12);
  for (let i = 0; i < 4; i++) {
    palettes[5][12 + i] = snesToRgba(shieldPal[i]);
  }

  // Auxiliary palette 3 (palette 0)
  const aux3 = rom.getWords(ADDR_SPRITE_PALETTE_AUX3, 84);
  for (let i = 0; i < 7; i++) {
    palettes[0][i + 1] = snesToRgba(aux3[i]);
  }

  // Palette 7 = the player's armor (Green Mail = armor 0)
  const armorPal = rom.getWords(ADDR_ARMOR_PALETTE, 15);
  for (let i = 0; i < 15; i++) {
    palettes[7][i + 1] = snesToRgba(armorPal[i]);
  }

  return { palettes };
};

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

export { loadSpritePalettes, buildPal5 };
export type { SpritePalettes };
