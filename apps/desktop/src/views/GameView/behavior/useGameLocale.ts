/* @layer renderer-app @kind hook */
import { useEffect } from 'react';
import { gameI18n, resolveGameTag } from '@app/shell/game-locale';
import { log } from '@app/log-bus';

const warn = (error: unknown): void => {
  log.error(`[GameLocale] Could not switch the game text language: ${error instanceof Error ? error.message : String(error)}`);
};

const useGameLocale = (language: string | null | undefined): void => {
  useEffect(() => {
    let live = true;
    resolveGameTag(language)
      .then((tag) => (live ? gameI18n.setLocale(tag) : undefined))
      .catch(warn);
    return () => {
      live = false;
    };
  }, [language]);
};

export { useGameLocale };
