/* @layer bridge-wasm @kind logic */
/**
 * Seed bookkeeping for a multi-screen flood.
 *
 * `propagateArea` used to flood each screen EXACTLY ONCE, with whatever seeds
 * it happened to hold at that moment, and then discard every crossing later
 * discovered into it (`analyzed.has(...) → continue`). A screen whose real way
 * in is only found once a NEIGHBOUR has been flooded therefore kept the small
 * extent its first, partial seed set produced — which is why the first
 * castle's four exterior quadrants each stopped at the first wall instead of
 * joining up, even though nothing had actually walked in or out of them yet.
 *
 * Seeds accumulate here instead, deduped by tile, so a screen can be re-run
 * with everything known about it so far. The caller decides whether a new seed
 * is worth a re-run (see `propagateArea`'s reachability test).
 */
import type { GridPos } from '@shared/game/navigation';

interface SeedLedger {
  /** Record a seed for a screen. False when that exact tile was already known. */
  add: (screenIndex: number, tile: GridPos) => boolean;
  /** Every seed this screen has been handed so far, in arrival order. */
  list: (screenIndex: number) => GridPos[];
}

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
export type { SeedLedger };
