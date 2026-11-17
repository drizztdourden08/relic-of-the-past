/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { TRANSPARENT } from '../../graphics/palette';
import { writeColors } from './write-colors';
import type { SpriteSource } from '../sources';
import type { RGBA } from '../../graphics/palette';
import type { SpritePalettes } from './receipt-palettes.type';

const rowOf = (palettes: RGBA[][], row: number): RGBA[] => itemAt(palettes, row, 'Sprite palette row');

const loadMainRows = (source: SpriteSource, palettes: RGBA[][]): void => {
  const mainSpr = source.readPaletteWords('spriteMain', 0, 120);
  for (let p = 0; p < 4; p++) {
    writeColors(rowOf(palettes, p + 1), 1, mainSpr.slice(p * 15, p * 15 + 15));
  }
};

const loadAux1Rows = (source: SpriteSource, palettes: RGBA[][]): void => {
  const aux1 = source.readPaletteWords('spriteAux1', 0, 168);
  for (const [sub, ai] of [[5, 0], [6, 7]] as const) {
    writeColors(rowOf(palettes, sub), 1, aux1.slice(ai * 7, ai * 7 + 7));
  }
  writeColors(rowOf(palettes, 6), 9, aux1.slice(6 * 7, 6 * 7 + 7));
};

const loadSwordAndShieldColors = (source: SpriteSource, palettes: RGBA[][]): void => {
  const swordPal = source.readPaletteWords('sword', 0, 12);
  writeColors(rowOf(palettes, 5), 9, swordPal.slice(0, 3));
  const shieldPal = source.readPaletteWords('shield', 0, 12);
  writeColors(rowOf(palettes, 5), 12, shieldPal.slice(0, 4));
};

const loadAux3Row = (source: SpriteSource, palettes: RGBA[][]): void => {
  const aux3 = source.readPaletteWords('spriteAux3', 0, 84);
  writeColors(rowOf(palettes, 0), 1, aux3.slice(0, 7));
};

const loadArmorRow = (source: SpriteSource, palettes: RGBA[][]): void => {
  const armorPal = source.readPaletteWords('armor', 0, 15);
  writeColors(rowOf(palettes, 7), 1, armorPal.slice(0, 15));
};

const loadSpritePalettes = (source: SpriteSource): SpritePalettes => {
  const palettes: RGBA[][] = Array.from({ length: 8 }, () => new Array<RGBA>(16).fill(TRANSPARENT));
  loadMainRows(source, palettes);
  loadAux1Rows(source, palettes);
  loadSwordAndShieldColors(source, palettes);
  loadAux3Row(source, palettes);
  loadArmorRow(source, palettes);
  return { palettes };
};

export { loadSpritePalettes };
