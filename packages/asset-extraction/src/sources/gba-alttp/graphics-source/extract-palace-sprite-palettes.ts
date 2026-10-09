/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import type { PalaceSpritePalette } from './graphics-source.type';
import { SPRITE_PALETTE_BYTES } from './graphics-source.constants';
import { PALACE_SPRITE_PALETTES } from './palace-sheets.constants';

const extractPalaceSpritePalettes = (rom: GbaRomReader): PalaceSpritePalette[] => (
  PALACE_SPRITE_PALETTES.map(source => ({ ...source, bgr555: Buffer.from(rom.romSlice(source.address, SPRITE_PALETTE_BYTES)) }))
);

export { extractPalaceSpritePalettes };
