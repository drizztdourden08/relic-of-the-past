/* @layer renderer-lib @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import type { FontReference } from '@rotp/asset-extraction';
import type { LanguageSetSummary } from '@rotp/languages';
import { getLanguageRomFont } from './get-language-rom-font';
import { listLanguageSets } from './list-language-sets';

const referenceOf = async (summary: LanguageSetSummary, base: string): Promise<FontReference | null> => {
  const config = kLanguages[summary.id];
  const font = config && summary.origin === 'rom' ? await getLanguageRomFont(summary.id) : null;
  if (!config || !font) return null;
  return {
    release: summary.id,
    tiles: Uint8Array.from(font.fontData),
    alphabet: config.alphabet,
    isBase: summary.id === base,
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
