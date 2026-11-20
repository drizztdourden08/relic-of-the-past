/* @layer renderer-app @kind logic */
import { appLocales } from '../../../.brock/locales';
import { GAME_LOCALE_OF } from './game-locale.constants';

const catalogTagOf = (code: string): string | undefined => {
  const tag = GAME_LOCALE_OF[code.toLowerCase()];
  return tag !== undefined && appLocales.tags.includes(tag) ? tag : undefined;
};

export { catalogTagOf };
