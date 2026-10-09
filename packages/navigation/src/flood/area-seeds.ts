/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { SeedLedger } from './area-seeds.type';

const createSeedLedger = (): SeedLedger => {
  const byScreen = new Map<number, GridPos[]>();
  const seen = new Map<number, Set<string>>();

  const add = (screenIndex: number, tile: GridPos): boolean => {
    let keys = seen.get(screenIndex);
    if (!keys) {
      keys = new Set<string>();
      seen.set(screenIndex, keys);
      byScreen.set(screenIndex, []);
    }
    const key = `${tile.row},${tile.col}`;
    if (keys.has(key)) return false;
    keys.add(key);
    byScreen.get(screenIndex)!.push(tile);
    return true;
  };

  const list = (screenIndex: number): GridPos[] => byScreen.get(screenIndex) ?? [];

  return { add, list };
};

export { createSeedLedger };
export type { SeedLedger } from './area-seeds.type';
