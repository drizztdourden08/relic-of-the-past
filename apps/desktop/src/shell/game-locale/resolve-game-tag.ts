/* @layer renderer-app @kind logic */
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';
import { listLanguageSets } from '@app/storage/languages-store';
import { catalogTagOf } from './catalog-tag-of';
import { GAME_LOCALE_FALLBACK } from './game-locale.constants';

const baseOf = async (id: string): Promise<string | undefined> => {
  const sets = await listLanguageSets();
  return sets.find((set) => set.id === id)?.base;
};

const resolveGameTag = async (language: string | null | undefined): Promise<string> => {
  const id = language === null || language === undefined || language === '' ? GAME_ROM_LANGUAGE : language;
  const direct = catalogTagOf(id);
  if (direct !== undefined) return direct;
  const base = await baseOf(id);
  return (base === undefined ? undefined : catalogTagOf(base)) ?? GAME_LOCALE_FALLBACK;
};

export { resolveGameTag };
