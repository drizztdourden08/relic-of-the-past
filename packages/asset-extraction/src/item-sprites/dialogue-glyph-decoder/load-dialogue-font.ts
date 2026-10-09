/* @layer shared-asset-extraction @kind logic */
import { kFontTypes, FONT_TILE_BYTES } from '../../text/data/font-data';
import type { RomData } from '../../rom/rom-types';

const loadDialogueFont = (rom: RomData): Buffer => {
  const source = kFontTypes[rom.language] ?? kFontTypes.us;
  return rom.getBytes(source.tileAddr, FONT_TILE_BYTES);
};

export { loadDialogueFont };
