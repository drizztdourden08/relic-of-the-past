/* @layer shared-game @kind logic */
import type { RequirementSet, TileReq, TraversalRequirement } from '@rotp/game-data';
import type { GridPos, ReachState } from '@rotp/game-core';
import type { DetectedRequirement, RequirementDetectorInput } from './requirement-detector.type';
import { GRID_SIZE } from '../types/grid.constants';
import { floodFillScreen } from '../flood-fill/orchestrator';
import { INVENTORY_PROGRESSION } from './analysis.constants';

const posKey = (p: GridPos): string => `${p.row},${p.col}`;

const reachesTarget = (reachable: ReachState[][], pos: GridPos): boolean => {
  const row = Math.min(pos.row, GRID_SIZE - 1);
  const col = Math.min(pos.col, GRID_SIZE - 1);
  return Boolean(reachable[row]?.[col]);
};

const requirementsOf = (inventoryItems: readonly TraversalRequirement[]): RequirementSet =>
  inventoryItems.length > 0 ? [inventoryItems.slice()] : [];

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
      if (reached.has(key) || !reachesTarget(floodResult.reachable, pos)) continue;
      reached.add(key);
      results.push({ position: pos, requirements: requirementsOf(inventoryItems) });
    }
  }

  for (const pos of targetPositions) {
    if (!reached.has(posKey(pos))) results.push({ position: pos, requirements: [] });
  }

  return results;
};

export { detectRequirements };
export type { DetectedRequirement, RequirementDetectorInput } from './requirement-detector.type';
