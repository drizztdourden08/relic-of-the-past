/* @layer shared-game @kind logic */
import type { RequirementSet } from '@rotp/game-data';
import type { TileReq } from '../tile-attrs';
import type { GridPos } from '../types';
import type { DetectedRequirement, RequirementDetectorInput } from './requirement-detector.type';
import { GRID_SIZE } from '../types';
import { floodFillScreen } from '../flood-fill/orchestrator';
import { INVENTORY_PROGRESSION } from './analysis.constants';

const posKey = (p: GridPos): string => `${p.row},${p.col}`;

const detectRequirements = (input: RequirementDetectorInput): DetectedRequirement[] => {
  const { screenIndex, getGrid, indoors, targetPositions } = input;

  let grid: number[][];
  try {
    grid = getGrid(screenIndex);
  } catch {
    return [];
  }

  if (targetPositions.length === 0) return [];

  const results: DetectedRequirement[] = [];
  const reached = new Set<string>();

  for (const inventoryItems of INVENTORY_PROGRESSION) {
    const inventory = new Set<TileReq>(inventoryItems as TileReq[]);
    const floodResult = floodFillScreen(grid, screenIndex, { indoors, inventory });

    for (const pos of targetPositions) {
      const key = posKey(pos);
      if (reached.has(key)) continue;

      const row = Math.min(pos.row, GRID_SIZE - 1);
      const col = Math.min(pos.col, GRID_SIZE - 1);
      if (!floodResult.reachable[row]?.[col]) continue;

      reached.add(key);
      const reqs: RequirementSet = inventoryItems.length > 0 ? [inventoryItems.slice()] : [];
      results.push({ position: pos, requirements: reqs });
    }
  }

  for (const pos of targetPositions) {
    if (!reached.has(posKey(pos))) results.push({ position: pos, requirements: [] });
  }

  return results;
};

export { detectRequirements };
export type { DetectedRequirement, RequirementDetectorInput } from './requirement-detector.type';
