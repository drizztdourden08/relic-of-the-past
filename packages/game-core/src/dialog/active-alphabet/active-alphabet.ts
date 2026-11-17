/* @layer bridge-wasm @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import { displayAlphabetOf } from '@rotp/game-data';
import { getModule } from '../../wasm-bridge';
import { readBaseLanguage } from '../../session-dialogue/read-base-language';
import { loadedExtraGlyphs } from '../../session-dialogue/extra-glyphs';
import { letterSlotChars } from '../../session-dialogue/letter-bank';
import { FALLBACK_CODE, JAPANESE_CODE } from './active-alphabet.constants';
import { activeLanguageCode } from './active-language-code';
import { japaneseAlphabet } from './japanese-alphabet';

const activeAlphabet = (): readonly string[] => {
  const mod = getModule();
  const setId = activeLanguageCode();
  const base = mod ? readBaseLanguage(mod, setId) : setId;
  if (base === JAPANESE_CODE) return japaneseAlphabet();
  const language = kLanguages[base] ?? kLanguages[FALLBACK_CODE];
  if (language === undefined) throw new Error(`language ${FALLBACK_CODE} is missing from the language table`);
  return displayAlphabetOf(language.alphabet, [...loadedExtraGlyphs(), ...letterSlotChars()]);
};

export { activeAlphabet };
