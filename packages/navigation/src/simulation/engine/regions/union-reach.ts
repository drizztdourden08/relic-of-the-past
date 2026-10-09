/* @layer shared-game @kind logic */
import type { RegionReachMap } from './regions.type';

const unionReach = (map: RegionReachMap, screenId: string, reached: boolean[][]): void => {
  const prev = map.get(screenId);
  if (!prev) {
    map.set(screenId, reached.map((row) => [...row]));
    return;
  }
  map.set(screenId, prev.map((row, r) => row.map((v, c) => v || (reached[r]?.[c] ?? false))));
};

export { unionReach };
