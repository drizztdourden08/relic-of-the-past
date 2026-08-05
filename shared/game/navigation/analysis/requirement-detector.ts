/* @layer shared-game @kind logic */
/**
 * Requirement Detector — Determines which items gate which connection points.
 *
 * Runs BFS with increasing item sets to determine the minimum requirements
 * for reaching each connection point from the screen's walkable interior.
 *
 * Input: Flood fill results at various inventory levels
 * Output: RequirementSet for each connection point / obstacle
 */

import type { RequirementSet, TraversalRequirement } from '../nav-data.types';
import type { TileReq } from '../tile-attrs';
import type { GridPos } from '../types';
import { GRID_SIZE } from '../types';
import { floodFillScreen } from '../flood-fill/orchestrator';

/** Inventory levels to test, from no items to all items */
const INVENTORY_PROGRESSION: TraversalRequirement[][] = [
  [],
  ['boots'],
  ['lift.1'],
  ['lift.1', 'boots'],
  ['lift.2'],
  ['flippers'],
  ['hammer'],
  ['hookshot'],
  ['bombs'],
  ['lift.1', 'lift.2', 'boots', 'flippers', 'hammer', 'hookshot', 'bombs', 'sword', 'mirror'],
];

interface RequirementDetectorInput {
  screenIndex: number;
  getGrid: (screenIndex: number) => number[][];
  indoors: boolean;
  /** Target tile positions to check reachability for (border tiles, entrances) */
  targetPositions: GridPos[];
}

interface DetectedRequirement {
  /** Grid position of the target tile */
  position: GridPos;
  /** Minimum requirements (OR-of-AND) to reach this tile */
  requirements: RequirementSet;
}

const detectRequirements = (input: RequirementDetectorInput): DetectedRequirement[] => {
  const { screenIndex, getGrid, indoors, targetPositions } = input;

  let grid: number[][];
  try {
    grid = getGrid(screenIndex);
  } catch {
    return [];
  }

  if (targetPositions.length === 0) return [];

  // Run flood fill at each inventory level and record which targets are reachable
  const results: DetectedRequirement[] = [];
  const reached = new Set<string>();
  const posKey = (p: GridPos) => `${p.row},${p.col}`;

  for (const inventoryItems of INVENTORY_PROGRESSION) {
    const inventory = new Set<TileReq>(inventoryItems as TileReq[]);

    const floodResult = floodFillScreen(grid, screenIndex, {
      indoors,
      inventory,
    });

    for (const pos of targetPositions) {
      const key = posKey(pos);
      if (reached.has(key)) continue;

      const row = Math.min(pos.row, GRID_SIZE - 1);
      const col = Math.min(pos.col, GRID_SIZE - 1);
      if (!floodResult.reachable[row]?.[col]) continue;

      // This inventory level reaches the tile — record it as the minimum AND set
      reached.add(key);
      const reqs: RequirementSet = inventoryItems.length > 0
        ? [inventoryItems.slice()]
        : [];
      results.push({ position: pos, requirements: reqs });
    }
  }

  // Any targets not reached even with full inventory get flagged as unreachable
  for (const pos of targetPositions) {
    const key = posKey(pos);
    if (!reached.has(key)) {
      // Mark as impossible (empty AND inside OR = always false is represented by [['impossible']])
      // But since RequirementSet is TraversalRequirement[][], we leave it as an impossible marker
      results.push({ position: pos, requirements: [] });
    }
  }

  return results;
};

export { INVENTORY_PROGRESSION, detectRequirements };
export type { RequirementDetectorInput, DetectedRequirement };
