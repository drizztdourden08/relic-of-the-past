/* @layer bridge-wasm @kind logic */
import type { ApGameData } from '../ap-protocol.type';
import type { CacheSplit } from './data-package-cache.type';
import { readCachedGame } from './read-cached-game';

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

export { splitByCache };
