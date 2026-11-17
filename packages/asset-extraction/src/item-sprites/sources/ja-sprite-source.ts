/* @layer shared-asset-extraction @kind logic */
import { readSheetPointer } from '../../screens/read-sheet-pointers';
import type { RomData } from '../../rom/rom-types';
import { createSnesSpriteSource } from './create-snes-sprite-source';
import { JA_REV1_SPRITE_ADDRESSES } from './ja-rev1';
import { JA_V1_0_SPRITE_ADDRESSES } from './ja-v1.0';
import { SPRITE_PALETTE_ADDRESSES } from './sprite-source.constants';
import type { SpriteSource } from './sprite-source.type';

const createJaSpriteSource = (rom: RomData): SpriteSource => {
  const table = rom.revision === 0 ? JA_V1_0_SPRITE_ADDRESSES : JA_REV1_SPRITE_ADDRESSES;
  return createSnesSpriteSource(rom, {
    id: table.id,
    sheetAddress: (kind, index) => readSheetPointer(rom, table.sheetPointers[kind], index),
    palettes: SPRITE_PALETTE_ADDRESSES,
    dialogueFontTile: null,
    titleStripes: table.titleStripes,
    polyPalette: table.polyPalette,
    legendStripes: table.legendStripes,
  });
};

export { createJaSpriteSource };
