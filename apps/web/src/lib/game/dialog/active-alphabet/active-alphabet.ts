/* @layer bridge-wasm @kind logic */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { displayAlphabetOf } from '@shared/game/dialog/dialogue-charset';
import { loadedExtraGlyphs } from '../../session-dialogue/extra-glyphs';
import { FALLBACK_CODE } from './active-alphabet.constants';
import { activeLanguageCode } from './active-language-code';

const activeAlphabet = (): readonly string[] =>
  displayAlphabetOf((kLanguages[activeLanguageCode()] ?? kLanguages[FALLBACK_CODE]).alphabet, loadedExtraGlyphs());

export { activeAlphabet };
