/* @layer bridge-wasm @kind logic */
/**
 * Data package cache, keyed by game and checksum in localStorage, so a reconnect to the
 * same room asks the server only for games whose tables changed. Every storage call is
 * guarded: without storage the cache is empty and every game is fetched.
 */
import type { ApGameData } from './ap-protocol.type';

const KEY_PREFIX = 'rotp.ap.datapackage.';

const cacheKey = (game: string, checksum: string): string => `${KEY_PREFIX}${game}.${checksum}`;

const readCachedGame = (game: string, checksum: string): ApGameData | null => {
  try {
    const raw = localStorage.getItem(cacheKey(game, checksum));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ApGameData;
    return parsed && typeof parsed.item_name_to_id === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const writeCachedGame = (game: string, data: ApGameData): void => {
  if (!data.checksum) return;
  try {
    localStorage.setItem(cacheKey(game, data.checksum), JSON.stringify(data));
  } catch { /* storage full or unavailable: the next connect fetches again */ }
};

interface CacheSplit {
  cached: Record<string, ApGameData>;
  missing: string[];
}

/** Splits the room's games into those the cache already holds and those to fetch. */
const splitByCache = (games: readonly string[], checksums: Record<string, string> | undefined): CacheSplit => {
  const cached: Record<string, ApGameData> = {};
  const missing: string[] = [];
  for (const game of new Set(games)) {
    const checksum = checksums?.[game];
    const hit = checksum ? readCachedGame(game, checksum) : null;
    if (hit) cached[game] = hit;
    else missing.push(game);
  }
  return { cached, missing };
};

export { readCachedGame, splitByCache, writeCachedGame };
export type { CacheSplit };
