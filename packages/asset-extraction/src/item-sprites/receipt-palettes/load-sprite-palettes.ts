/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { TRANSPARENT } from '../../graphics/palette';
import { writeColors } from './write-colors';
import {
  ADDR_SPRITE_PALETTE_MAIN, ADDR_SPRITE_PALETTE_AUX1,
  ADDR_SPRITE_PALETTE_AUX3, ADDR_SWORD_PALETTE,
  ADDR_SHIELD_PALETTE, ADDR_ARMOR_PALETTE,
} from '../../data/constants';
import type { RomData } from '../../rom/rom-types';
import type { RGBA } from '../../graphics/palette';
import type { SpritePalettes } from './receipt-palettes.type';

const rowOf = (palettes: RGBA[][], row: number): RGBA[] => itemAt(palettes, row, 'Sprite palette row');

const loadMainRows = (rom: RomData, palettes: RGBA[][]): void => {
  const mainSpr = rom.getWords(ADDR_SPRITE_PALETTE_MAIN, 120);
  for (let p = 0; p < 4; p++) {
    writeColors(rowOf(palettes, p + 1), 1, mainSpr.slice(p * 15, p * 15 + 15));
  }
};

const loadAux1Rows = (rom: RomData, palettes: RGBA[][]): void => {
  const aux1 = rom.getWords(ADDR_SPRITE_PALETTE_AUX1, 168);
  for (const [sub, ai] of [[5, 0], [6, 7]] as const) {
    writeColors(rowOf(palettes, sub), 1, aux1.slice(ai * 7, ai * 7 + 7));
  }
  writeColors(rowOf(palettes, 6), 9, aux1.slice(6 * 7, 6 * 7 + 7));
};

const loadSwordAndShieldColors = (rom: RomData, palettes: RGBA[][]): void => {
  const swordPal = rom.getWords(ADDR_SWORD_PALETTE, 12);
  writeColors(rowOf(palettes, 5), 9, swordPal.slice(0, 3));
  const shieldPal = rom.getWords(ADDR_SHIELD_PALETTE, 12);
  writeColors(rowOf(palettes, 5), 12, shieldPal.slice(0, 4));
};

const loadAux3Row = (rom: RomData, palettes: RGBA[][]): void => {
  const aux3 = rom.getWords(ADDR_SPRITE_PALETTE_AUX3, 84);
  writeColors(rowOf(palettes, 0), 1, aux3.slice(0, 7));
};

const loadArmorRow = (rom: RomData, palettes: RGBA[][]): void => {
  const armorPal = rom.getWords(ADDR_ARMOR_PALETTE, 15);
  writeColors(rowOf(palettes, 7), 1, armorPal.slice(0, 15));
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
