/* @layer shared-asset-extraction @kind logic */
import { kLanguages } from '../data/language-data';
import type { DecodedString, RomByteReader } from './dialogue-decoder.type';
import { decodeStringsWithConfig } from './decode-strings-with-config';

const decodeStrings = (getByte: RomByteReader, lang: string): DecodedString[] => {
  const info = kLanguages[lang];
  if (!info) throw new Error(`Unknown language: ${lang}`);
  return decodeStringsWithConfig(getByte, info, lang);
};

export { decodeStrings };
