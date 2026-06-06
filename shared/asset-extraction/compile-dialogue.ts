/**
 * Dialogue asset compilation — text encoding, dictionary, and font data.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { packArrays } from './asset-builder';
import { decodeStrings } from './text/dialogue-decoder';
import { compressStrings, encodeDictionary } from './text/dialogue-encoder';
import { usesNewFormat } from './text/language-data';

const buildDialogue = (rom: RomData, A: AssetBuilder): void => {
  const lang = 'us';

  // 1. Decode dialogue strings from ROM
  const decoded = decodeStrings((addr) => rom.getByte(addr), lang);
  let texts = decoded.map(d => d.text);

  // US ROM has 396 strings — insert the extra control string at index 4
  if (texts.length === 396) {
    const extraStr = '[Speed 00]0- [Number 00]. 1- [Number 01][2]2- [Number 02]. 3- [Number 03]';
    texts = [...texts.slice(0, 4), extraStr, ...texts.slice(4)];
  }

  // 2. Compress dialogue strings and encode dictionary
  const compressed = compressStrings(texts, lang);
  const dict = encodeDictionary(lang);

  // 3. Pack into nested format: pack([dict_packed, dialogue_packed])
  const dictPacked = packArrays(dict.map(d => Buffer.from(d)));
  const dialoguePacked = packArrays(compressed.map(c => Buffer.from(c)));
  const langData = packArrays([dictPacked, dialoguePacked]);

  // 4. Font data from ROM (2-bit tile format)
  const fontData = Buffer.from(rom.getBytes(0x8E8000, 256 * 16));
  const fontWidth = Buffer.from(rom.getBytes(0x8ECADF, 99));
  const fontPacked = packArrays([fontData, fontWidth]);

  // 5. Language mapping
  const flags = usesNewFormat(lang) ? 1 : 0;
  const mappingData = packArrays([
    Buffer.from(lang, 'utf8'),
    Buffer.from([0, 0, flags]),
  ]);

  A.addPacked('kDialogue', [langData]);
  A.addPacked('kDialogueFont', [fontPacked]);
  A.addPacked('kDialogueMap', [mappingData]);
};

export { buildDialogue };
