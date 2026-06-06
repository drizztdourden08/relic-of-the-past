/**
 * Screen Updater — Writes computed RegionNavData back into screen definitions.
 *
 * After analysis completes, this module takes the computed nav data and
 * serializes it into a JSON output file loaded at runtime.
 *
 * Design: Produces a JSON blob that can be:
 *   a) Written as a standalone .json asset loaded at runtime
 *   b) Imported back into source via codegen
 */

import type { RegionNavData, ConnectionPointData, NavObstacle } from '../nav-data.types';
import type { FloodFillResult } from '../types';
import type { ScreenDefinition } from '../../types';
import { findBorderBundles } from './border-bundles';
import type { ResolvedEntrance } from './entrance-resolver';

interface ScreenNavUpdate {
  screenId: string;
  screenIndex: number;
  nav: RegionNavData;
}

interface ScreenUpdaterInput {
  regions: ScreenDefinition[];
  tileStats: Map<number, { totalTiles: number; freeTileCount: number; maxReachableTileCount: number }>;
  floodResults: Map<number, FloodFillResult>;
  resolvedEntrances: ResolvedEntrance[];
}

const buildScreenNavUpdates = (input: ScreenUpdaterInput): ScreenNavUpdate[] => {
  const { regions, tileStats, floodResults, resolvedEntrances } = input;
  const updates: ScreenNavUpdate[] = [];

  // Index entrances by screen
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

    // Build connection point IDs from border bundles + entrance points
    const connectionPointIds: string[] = [];
    const floodResult = floodResults.get(screenIndex);
    if (floodResult) {
      const bundles = findBorderBundles(floodResult);
      for (const b of bundles) {
        connectionPointIds.push(b.id);
      }
    }

    const screenEntrances = entrancesByScreen.get(screenIndex) ?? [];
    for (const re of screenEntrances) {
      connectionPointIds.push(re.point.id);
    }

    // Obstacles from flood result's reqGrid (tiles that need items)
    const obstacles: NavObstacle[] = [];
    if (floodResult?.reqGrid) {
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
              requirements: [[req as any]],
            });
          }
        }
      }
    }

    const nav: RegionNavData = {
      totalTiles: stats.totalTiles,
      freeTileCount: stats.freeTileCount,
      maxReachableTileCount: stats.maxReachableTileCount,
      connectionPointIds,
      obstacles,
      features: [], // Features require deeper analysis (hookshot targets, fairy fountains, etc.)
    };

    updates.push({ screenId: screen.id, screenIndex, nav });
  }

  return updates;
};

const obstacleTypeFromAttr = (attr: number): NavObstacle['type'] | null => {
  // Map ROM attr bytes to obstacle types
  if (attr >= 0x50 && attr <= 0x57) return 'light_rock';  // lift.1 rocks
  if (attr >= 0x58 && attr <= 0x5F) return 'dark_rock';   // lift.2 rocks
  if (attr >= 0x44 && attr <= 0x47) return 'bush';        // lift.1 bushes
  if (attr === 0x4A || attr === 0x4B) return 'hammer_peg';
  if (attr === 0x66) return 'deep_water';
  if (attr === 0x62 || attr === 0x63) return 'bombable_wall';
  if (attr === 0x6C) return 'spike_floor';
  return null;
};

const writeScreenNavData = (updates: ScreenNavUpdate[], outputPath: string): void => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const data = Object.fromEntries(
    updates.map(u => [u.screenId, { screenIndex: u.screenIndex, ...u.nav }])
  );
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
};

export { buildScreenNavUpdates, writeScreenNavData };
export type { ScreenNavUpdate, ScreenUpdaterInput };
