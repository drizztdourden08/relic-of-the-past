/* @layer bridge-wasm @kind logic */
import type { ApGameData } from '../ap-protocol.type';
import { cacheKey } from './cache-key';

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

export { readCachedGame };
