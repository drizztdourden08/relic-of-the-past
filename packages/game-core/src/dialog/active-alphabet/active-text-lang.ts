/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';
import { readBaseLanguage } from '../../session-dialogue/read-base-language';
import { JAPANESE_CODE } from './active-alphabet.constants';
import { activeLanguageCode } from './active-language-code';

const activeTextLang = (): string | undefined => {
  const mod = getModule();
  const setId = activeLanguageCode();
  const base = mod ? readBaseLanguage(mod, setId) : setId;
  return base === JAPANESE_CODE ? JAPANESE_CODE : undefined;
};

export { activeTextLang };
