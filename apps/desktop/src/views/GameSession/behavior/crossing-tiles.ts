/* @layer renderer-appshell @kind logic */
import { CROSSING_ROW_AFTER, CROSSING_ROW_BEFORE, ROOM_TILE_COUNT } from './nav-dump.constants';

const crossingTiles = (reachable: number[][], axis: 'horizontal' | 'vertical'): Array<{ axis: string; pos: number }> => {
  const tiles: Array<{ axis: string; pos: number }> = [];
  for (let pos = 0; pos < ROOM_TILE_COUNT; pos++) {
    const before = axis === 'horizontal' ? reachable[CROSSING_ROW_BEFORE]?.[pos] : reachable[pos]?.[CROSSING_ROW_BEFORE];
    const after = axis === 'horizontal' ? reachable[CROSSING_ROW_AFTER]?.[pos] : reachable[pos]?.[CROSSING_ROW_AFTER];
    if (before && after) tiles.push({ axis, pos });
  }
  return tiles;
};

export { crossingTiles };
