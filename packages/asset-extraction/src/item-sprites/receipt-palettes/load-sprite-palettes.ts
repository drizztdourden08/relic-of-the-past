/* @layer shared-asset-extraction @kind logic */
import { snesToRgba, TRANSPARENT } from '../../graphics/palette';
import {
  ADDR_SPRITE_PALETTE_MAIN, ADDR_SPRITE_PALETTE_AUX1,
  ADDR_SPRITE_PALETTE_AUX3, ADDR_SWORD_PALETTE,
  ADDR_SHIELD_PALETTE, ADDR_ARMOR_PALETTE,
} from '../../data/constants';
import type { RomData } from '../../rom/rom-types';
import type { RGBA } from '../../graphics/palette';
import type { SpritePalettes } from './receipt-palettes.type';

const loadMainRows = (rom: RomData, palettes: RGBA[][]): void => {
  const mainSpr = rom.getWords(ADDR_SPRITE_PALETTE_MAIN, 120);
  for (let p = 0; p < 4; p++) {
    for (let i = 0; i < 15; i++) {
      palettes[p + 1][i + 1] = snesToRgba(mainSpr[p * 15 + i]);
    }
  }
};

const loadAux1Rows = (rom: RomData, palettes: RGBA[][]): void => {
  const aux1 = rom.getWords(ADDR_SPRITE_PALETTE_AUX1, 168);
  for (const [sub, ai] of [[5, 0], [6, 7]] as const) {
    for (let i = 0; i < 7; i++) {
      palettes[sub][i + 1] = snesToRgba(aux1[ai * 7 + i]);
    }
  }
  for (let i = 0; i < 7; i++) {
    palettes[6][i + 9] = snesToRgba(aux1[6 * 7 + i]);
  }
};

const loadSwordAndShieldColors = (rom: RomData, palettes: RGBA[][]): void => {
  const swordPal = rom.getWords(ADDR_SWORD_PALETTE, 12);
  for (let i = 0; i < 3; i++) {
    palettes[5][9 + i] = snesToRgba(swordPal[i]);
  }
  const shieldPal = rom.getWords(ADDR_SHIELD_PALETTE, 12);
  for (let i = 0; i < 4; i++) {
    palettes[5][12 + i] = snesToRgba(shieldPal[i]);
  }
};

const loadAux3Row = (rom: RomData, palettes: RGBA[][]): void => {
  const aux3 = rom.getWords(ADDR_SPRITE_PALETTE_AUX3, 84);
  for (let i = 0; i < 7; i++) {
    palettes[0][i + 1] = snesToRgba(aux3[i]);
  }
};

const loadArmorRow = (rom: RomData, palettes: RGBA[][]): void => {
  const armorPal = rom.getWords(ADDR_ARMOR_PALETTE, 15);
  for (let i = 0; i < 15; i++) {
    palettes[7][i + 1] = snesToRgba(armorPal[i]);
  }
};

const loadSpritePalettes = (rom: RomData): SpritePalettes => {
  const palettes: RGBA[][] = Array.from({ length: 8 }, () =>
    new Array(16).fill(TRANSPARENT) as RGBA[]
  );
  loadMainRows(rom, palettes);
  loadAux1Rows(rom, palettes);
  loadSwordAndShieldColors(rom, palettes);
  loadAux3Row(rom, palettes);
  loadArmorRow(rom, palettes);
  return { palettes };
};

export { loadSpritePalettes };
