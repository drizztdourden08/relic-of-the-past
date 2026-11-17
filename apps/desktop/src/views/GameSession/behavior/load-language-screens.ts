/* @layer renderer-appshell @kind logic */
import { setLanguageScreens } from '@rotp/game-core';
import { compileScreens } from '@rotp/languages';
import { log } from '@app/log-bus';
import { getLanguageSet } from '@app/storage/languages-store';

const loadLanguageScreens = async (language: string | undefined): Promise<void> => {
  if (!language) { setLanguageScreens([]); return; }
  try {
    const set = await getLanguageSet(language);
    setLanguageScreens(compileScreens(set?.screens));
  } catch (err) {
    log.error(`[LanguageScreens] Failed to read the screens of "${language}": ${err instanceof Error ? err.message : err}`);
    setLanguageScreens([]);
  }
};

export { loadLanguageScreens };
