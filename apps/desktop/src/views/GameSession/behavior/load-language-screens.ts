/* @layer renderer-appshell @kind logic */
import { setLanguageScreens } from '@rotp/game-core';
import { compileScreens } from '@rotp/languages';
import { log } from '@app/log-bus';
import { getLanguageSet } from '@app/storage/languages-store';
import { NO_LANGUAGE_GRAPHICS, languageAvailabilityOf, useLanguageGraphicsStore } from '@app/stores/language-graphics-store';

const loadLanguageScreens = async (language: string | undefined): Promise<void> => {
  const { setAvailability } = useLanguageGraphicsStore.getState();
  if (!language) { setLanguageScreens([]); setAvailability(NO_LANGUAGE_GRAPHICS); return; }
  try {
    const set = await getLanguageSet(language);
    if (set && !set.screens) log.app(`[LanguageScreens] "${language}" carries no screens: the file select, menus and HUD keep the US ones until its ROM is imported again`, 'warn');
    setLanguageScreens(compileScreens(set?.screens));
    setAvailability(languageAvailabilityOf(set));
  } catch (err) {
    log.error(`[LanguageScreens] Failed to read the screens of "${language}": ${err instanceof Error ? err.message : err}`);
    setLanguageScreens([]);
    setAvailability(NO_LANGUAGE_GRAPHICS);
  }
};

export { loadLanguageScreens };
