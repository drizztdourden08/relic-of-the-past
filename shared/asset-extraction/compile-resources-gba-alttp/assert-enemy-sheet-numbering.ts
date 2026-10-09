/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { compareSpriteSheets } from '../sources/gba-alttp';
import { TILES_PER_SPRITE_SHEET } from './compile-resources-gba-alttp.constants';

const assertEnemySheetNumbering = (snes: RomData, sheets: Parameters<typeof compareSpriteSheets>[1]): void => {
  const sheetMatches = compareSpriteSheets(snes, sheets);
  const matched = sheetMatches.filter(match => match.matchingTiles === TILES_PER_SPRITE_SHEET).length;
  if (matched < sheetMatches.length / 2) {
    throw new Error(`Only ${matched} of ${sheetMatches.length} enemy sheets match the base sheet of the same id; the sheet numbering no longer holds`);
  }
};

export { assertEnemySheetNumbering };
