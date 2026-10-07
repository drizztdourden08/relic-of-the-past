/* @layer bridge-wasm @kind logic */
/**
 * Glyph ids to text for the modern font. The alphabet is the active language's, read the way the
 * core reads it (the INI's Language key). Picture glyphs keep their bracketed token name so a row
 * renderer can tell them apart and draw them from the glyph sheet instead.
 */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { getModule } from '../wasm-bridge';

const FALLBACK_CODE = 'us';

const activeLanguageCode = (): string => {
  const mod = getModule();
  if (!mod) return FALLBACK_CODE;
  try {
    const ini = new TextDecoder().decode(mod.FS.readFile('/zelda3.ini'));
    return /^\s*Language\s*=\s*(\S+)/m.exec(ini)?.[1] ?? FALLBACK_CODE;
  } catch {
    return FALLBACK_CODE;
  }
};

const activeAlphabet = (): readonly string[] =>
  (kLanguages[activeLanguageCode()] ?? kLanguages[FALLBACK_CODE]).alphabet;

export { activeAlphabet, activeLanguageCode };
