/* @layer renderer-lib @kind logic */
import { alphabetWithGlyphs, kLanguages } from '@rotp/asset-extraction';
import type { FontReference } from '@rotp/asset-extraction';
import type { LanguageSetSummary } from '@rotp/languages';
import { getLanguageSet } from './get-language-set';
import { getLanguageSetFont } from './get-language-set-font';
import { listLanguageSets } from './list-language-sets';

const referenceOf = async (summary: LanguageSetSummary, base: string): Promise<FontReference | null> => {
  const config = kLanguages[summary.base];
  const font = config ? await getLanguageSetFont(summary.id) : null;
  if (!config || !font) return null;
  const set = await getLanguageSet(summary.id);
  return {
    release: summary.base,
    tiles: Uint8Array.from(font.fontData),
    widths: Uint8Array.from(font.fontWidth),
    alphabet: alphabetWithGlyphs(config.alphabet, set?.glyphs),
    isBase: summary.origin === 'rom' && summary.id === base,
  };
};

const setFontReferences = async (base: string): Promise<FontReference[]> => {
  const out: FontReference[] = [];
  for (const summary of await listLanguageSets()) {
    const reference = await referenceOf(summary, base).catch(() => null);
    if (reference) out.push(reference);
  }
  return out;
};

export { setFontReferences };
