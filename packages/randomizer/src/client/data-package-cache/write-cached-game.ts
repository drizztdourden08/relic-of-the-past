/* @layer bridge-wasm @kind logic */
import type { ApGameData } from '../ap-protocol.type';
import { cacheKey } from './cache-key';

const writeCachedGame = (game: string, data: ApGameData): void => {
  if (!data.checksum) return;
  try {
    localStorage.setItem(cacheKey(game, data.checksum), JSON.stringify(data));
  } catch {
    return undefined;
  }
};

export { writeCachedGame };
