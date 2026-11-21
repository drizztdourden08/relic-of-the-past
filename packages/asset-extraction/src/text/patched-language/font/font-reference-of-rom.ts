/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../../rom/rom-types';
import { FONT_TILE_BYTES, kFontTypes } from '../../data/font-data';
import { kLanguages } from '../../data/language-data';
import type { FontReference } from './font.type';

const fontReferenceOfRom = (rom: RomData, base: string): FontReference | null => {
  const source = kFontTypes[rom.language];
  const config = kLanguages[rom.language];
  if (!source || !config) return null;
  return {
    release: rom.language,
    tiles: new Uint8Array(rom.getBytes(source.tileAddr, FONT_TILE_BYTES)),
    alphabet: config.alphabet,
    isBase: rom.language === base,
  };
};

export { fontReferenceOfRom };
