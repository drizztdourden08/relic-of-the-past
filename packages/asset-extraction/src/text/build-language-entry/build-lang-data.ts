/* @layer shared-asset-extraction @kind logic */
import { packArrays } from '../../asset-builder/pack-arrays';
import { RANDOMIZER_MSG_BASE, randomizerTemplateTexts } from '../data/randomizer-templates';
import { compressStrings, encodeDictionary } from '../dialogue-encoder';
import type { GlyphMap } from '../glyph-map';
import { encodeLetterList } from '../letter-list';
import { normalizeTexts } from './normalize-texts';

const buildLangData = (texts: string[], code: string, glyphs?: GlyphMap, letters: readonly string[] = []): Buffer => {
  const vanilla = normalizeTexts(texts);
  if (vanilla.length !== RANDOMIZER_MSG_BASE) {
    throw new Error(`buildLangData: expected ${RANDOMIZER_MSG_BASE} vanilla dialogue lines for "${code}", got ${vanilla.length}`);
  }
  const all = [...vanilla, ...randomizerTemplateTexts(code)];
  const dictPacked = packArrays(encodeDictionary(code).map((d) => Buffer.from(d)));
  const dialoguePacked = packArrays(compressStrings(all, code, glyphs).map((c) => Buffer.from(c)));
  const parts = [dictPacked, dialoguePacked];
  if (letters.length > 0) parts.push(encodeLetterList(letters));
  return packArrays(parts);
};

export { buildLangData };
