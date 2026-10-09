/* @layer shared-game @kind types */
import type { RequirementSet } from '@rotp/game-data';
import type { GridPos } from '../types';

interface RequirementDetectorInput {
  screenIndex: number;
  getGrid: (screenIndex: number) => number[][];
  indoors: boolean;
  targetPositions: GridPos[];
}

interface DetectedRequirement {
  position: GridPos;
  requirements: RequirementSet;
}

export type { DetectedRequirement, RequirementDetectorInput };
