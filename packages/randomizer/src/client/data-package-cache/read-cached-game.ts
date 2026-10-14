/* @layer bridge-wasm @kind logic */
import type { ApGameData } from '../ap-protocol.type';
import { cacheKey } from './cache-key';
import { isCachedGame } from './is-cached-game';

const readCachedGame = (game: string, checksum: string): ApGameData | null => {
  try {
    const raw = localStorage.getItem(cacheKey(game, checksum));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCachedGame(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export { readCachedGame };
