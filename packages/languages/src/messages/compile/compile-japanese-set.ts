/* @layer shared-game @kind logic */
import type { PackedLangEntry, ScreenPayload } from '@rotp/asset-extraction';
import { buildJapaneseEntry } from '@rotp/asset-extraction';
import type { LanguageSet } from '../types';
import { bakedTexts } from './baked-texts';
import { compileScreens } from './compile-screens';

// A Japanese set bakes text and layouts only: its glyphs (dialogue and tilemap fonts) are the Japanese
// graphics pack's, so a font a set file still holds is never baked.
const textOnly = (screens: ScreenPayload | undefined): ScreenPayload | undefined =>
  screens ? { ...screens, tilemapFontData: undefined } : undefined;

const compileJapaneseSet = (set: LanguageSet): PackedLangEntry => {
  const packed = buildJapaneseEntry({ code: set.id, texts: bakedTexts(set) });
  const screens = compileScreens(textOnly(set.screens));
  return { ...packed, base: set.base, ...(screens.length > 0 ? { screens } : {}) };
};

export { compileJapaneseSet };
