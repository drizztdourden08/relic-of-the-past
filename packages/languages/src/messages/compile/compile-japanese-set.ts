/* @layer shared-game @kind logic */
import type { PackedLangEntry } from '@rotp/asset-extraction';
import { buildJapaneseEntry } from '@rotp/asset-extraction';
import type { LanguageSet } from '../types';
import type { SetFont } from './compile.type';
import { bakedTexts } from './baked-texts';
import { compileScreens } from './compile-screens';

const compileJapaneseSet = (set: LanguageSet, font: SetFont): PackedLangEntry => {
  const packed = buildJapaneseEntry({
    code: set.id,
    texts: bakedTexts(set),
    fontData: font.fontData,
    fontWidth: font.fontWidth,
  });
  const screens = compileScreens(set.screens);
  return { ...packed, base: set.base, ...(screens.length > 0 ? { screens } : {}) };
};

export { compileJapaneseSet };
