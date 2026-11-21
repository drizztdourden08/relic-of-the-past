/* @layer shared-game @kind logic */
import type { PackedLangEntry } from '@rotp/asset-extraction';
import { buildPackedEntry, kLanguages } from '@rotp/asset-extraction';
import { bakedLetterTable } from '@rotp/game-data';
import type { LanguageSet } from '../types';
import type { SetFont } from './compile.type';
import { bakedTexts } from './baked-texts';
import { compileJapaneseSet } from './compile-japanese-set';
import { compileScreens } from './compile-screens';
import { NON_BASE_INDEX } from './compile.constants';

const compileSet = (set: LanguageSet, font: SetFont): PackedLangEntry => {
  if (set.script === 'japanese') return compileJapaneseSet(set);
  const cfg = kLanguages[set.base];
  if (!cfg) throw new Error(`compileSet: unknown base language "${set.base}" for set "${set.id}"`);

  const table = bakedLetterTable(bakedTexts(set), set.base);
  const packed = buildPackedEntry({
    code: set.base,
    texts: table.texts,
    fontData: font.fontData,
    fontWidth: font.fontWidth,
    index: NON_BASE_INDEX,
    glyphs: table.glyphs,
    letters: table.letters,
  });

  const screens = compileScreens(set.screens);
  return { ...packed, code: set.id, base: set.base, ...(screens.length > 0 ? { screens } : {}) };
};

export { compileSet };
