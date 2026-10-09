/* @layer shared-game @kind logic */
import type { RegionNavData, NavObstacle, TraversalRequirement } from '../nav-data.types';
import type { FloodFillResult } from '../types';
import type { ResolvedEntrance } from './entrance-resolver.type';
import type { ScreenNavUpdate, ScreenUpdaterInput } from './screen-updater.type';
import { findBorderBundles } from './border-bundles';
import { OBSTACLE_ATTR_RANGES } from './screen-updater.constants';

const obstacleTypeFromAttr = (attr: number): NavObstacle['type'] | null =>
  OBSTACLE_ATTR_RANGES.find(({ first, last }) => attr >= first && attr <= last)?.type ?? null;

const obstaclesOf = (floodResult: FloodFillResult): NavObstacle[] => {
  const obstacles: NavObstacle[] = [];
  if (!floodResult.reqGrid) return obstacles;
  const seen = new Set<string>();
  for (let r = 0; r < floodResult.reqGrid.length; r++) {
    for (let c = 0; c < floodResult.reqGrid[r].length; c++) {
      const req = floodResult.reqGrid[r][c];
      if (!req) continue;
      const key = `${r},${c},${req}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const attrByte = floodResult.attrGrid?.[r]?.[c] ?? 0;
      const type = obstacleTypeFromAttr(attrByte);
      if (type) {
        obstacles.push({
          position: { row: r, col: c },
          tileAttr: attrByte,
          type,
          requirements: [[req as TraversalRequirement]],
        });
      }
    }
  }
  return obstacles;
};

const buildScreenNavUpdates = (input: ScreenUpdaterInput): ScreenNavUpdate[] => {
  const { regions, tileStats, floodResults, resolvedEntrances } = input;
  const updates: ScreenNavUpdate[] = [];

  const entrancesByScreen = new Map<number, ResolvedEntrance[]>();
  for (const re of resolvedEntrances) {
    let arr = entrancesByScreen.get(re.screenIndex);
    if (!arr) { arr = []; entrancesByScreen.set(re.screenIndex, arr); }
    arr.push(re);
  }

  for (const screen of regions) {
    if (screen.roomIndex === undefined) continue;
    const screenIndex = screen.roomIndex;
    const stats = tileStats.get(screenIndex);
    if (!stats) continue;

    const floodResult = floodResults.get(screenIndex);
    const connectionPointIds: string[] = [
      ...(floodResult ? findBorderBundles(floodResult).map((b) => b.id) : []),
      ...(entrancesByScreen.get(screenIndex) ?? []).map((re) => re.point.id),
    ];

    const nav: RegionNavData = {
      totalTiles: stats.totalTiles,
      freeTileCount: stats.freeTileCount,
      maxReachableTileCount: stats.maxReachableTileCount,
      connectionPointIds,
      obstacles: floodResult ? obstaclesOf(floodResult) : [],
      features: [],
    };

    updates.push({ screenId: screen.id, screenIndex, nav });
  }

  return updates;
};

export { buildScreenNavUpdates };
export type { ScreenNavUpdate, ScreenUpdaterInput } from './screen-updater.type';
