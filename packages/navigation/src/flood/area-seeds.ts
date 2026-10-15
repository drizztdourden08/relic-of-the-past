/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { SeedLedger } from './area-seeds.type';

const createSeedLedger = (): SeedLedger => {
  const byScreen = new Map<number, GridPos[]>();
  const seen = new Map<number, Set<string>>();

  const add = (screenIndex: number, tile: GridPos): boolean => {
    let keys = seen.get(screenIndex);
    let tiles = byScreen.get(screenIndex);
    if (!keys || !tiles) {
      keys = new Set<string>();
      tiles = [];
      seen.set(screenIndex, keys);
      byScreen.set(screenIndex, tiles);
    }
    const key = `${tile.row},${tile.col}`;
    if (keys.has(key)) return false;
    keys.add(key);
    tiles.push(tile);
    return true;
  };

  const list = (screenIndex: number): GridPos[] => byScreen.get(screenIndex) ?? [];

  return { add, list };
};

export { createSeedLedger };
