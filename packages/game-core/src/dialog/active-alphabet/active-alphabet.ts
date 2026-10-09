/* @layer bridge-wasm @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import { displayAlphabetOf } from '@rotp/game-data';
import { loadedExtraGlyphs } from '../../session-dialogue/extra-glyphs';
import { FALLBACK_CODE } from './active-alphabet.constants';
import { activeLanguageCode } from './active-language-code';

const activeAlphabet = (): readonly string[] => {
  const language = kLanguages[activeLanguageCode()] ?? kLanguages[FALLBACK_CODE];
  if (language === undefined) throw new Error(`language ${FALLBACK_CODE} is missing from the language table`);
  return displayAlphabetOf(language.alphabet, loadedExtraGlyphs());
};

export { activeAlphabet };
