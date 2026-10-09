/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';
import { FALLBACK_CODE, INI_PATH } from './active-alphabet.constants';

const activeLanguageCode = (): string => {
  const mod = getModule();
  if (!mod) return FALLBACK_CODE;
  try {
    const ini = new TextDecoder().decode(mod.FS.readFile(INI_PATH));
    return /^\s*Language\s*=\s*(\S+)/m.exec(ini)?.[1] ?? FALLBACK_CODE;
  } catch {
    return FALLBACK_CODE;
  }
};

export { activeLanguageCode };
