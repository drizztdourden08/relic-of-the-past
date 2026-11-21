/* @layer shared-asset-extraction @kind logic */
import { bgSheetAddress } from '../../data/bg-sheet-address';
import { spriteSheetAddress } from '../../data/sprite-sheet-address';
import type { RomData } from '../../rom/rom-types';
import { kFontTypes } from '../../text/data/font-data';
import { createSnesSpriteSource } from './create-snes-sprite-source';
import { SPRITE_PALETTE_ADDRESSES } from './sprite-source.constants';
import type { SpriteSource } from './sprite-source.type';

const createUsSpriteSource = (rom: RomData): SpriteSource =>
  createSnesSpriteSource(rom, {
    id: 'us',
    sheetAddress: (kind, index) => (kind === 'spr' ? spriteSheetAddress(index) : bgSheetAddress(index)),
    palettes: SPRITE_PALETTE_ADDRESSES,
    dialogueFontTile: (kFontTypes[rom.language] ?? kFontTypes.us)?.tileAddr ?? null,
    titleStripes: 0x0cdd6d,
    polyPalette: 0x8cc425,
    legendStripes: 0x8cfac2,
  });

export { createUsSpriteSource };
