/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { FONT_TILE_BYTES, kFontTypes } from '../data/font-data';
import { kLanguages } from '../data/language-data';
import { decodeStrings } from '../dialogue-decoder';
import type { ExtractedLangEntry } from './build-language-entry.type';
import { buildFontPacked } from './build-font-packed';
import { buildLangData } from './build-lang-data';
import { dialogueFlags } from './dialogue-flags';
import { normalizeTexts } from './normalize-texts';

const extractLangEntry = (rom: RomData, code: string, index: number): ExtractedLangEntry => {
  if (!kLanguages[code]) throw new Error(`Unknown language: ${code}`);
  const font = kFontTypes[code];
  if (!font) throw new Error(`No font source for language: ${code}`);

  const decoded = decodeStrings((addr) => rom.getByte(addr), code);
  const texts = normalizeTexts(decoded.map((d) => d.text));

  const fontData = rom.getBytes(font.tileAddr, FONT_TILE_BYTES);
  const fontWidth = rom.getBytes(font.widthAddr, font.widthCount);

  return {
    code,
    langData: buildLangData(texts, code),
    fontPacked: buildFontPacked(fontData, fontWidth),
    flags: dialogueFlags(code, index),
    fontData,
    fontWidth,
    glyphCount: font.widthCount,
    lineCount: texts.length,
    encoder: kLanguages[code].encoder,
    lines: texts.map((content, i) => ({ id: i + 1, content })),
  };
};

export { extractLangEntry };
