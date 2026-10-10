/* @layer shared-game @kind types */
import type { LedgeTraversal, TilePassability } from '@rotp/game-core';
import type { LedgeStep } from '../indoor-ledge-dirs.type';

interface CliffScan {
  grid: TilePassability[][];
  rawAttr: number[][];
  ledges: LedgeTraversal[];
  isIndoors: boolean;
  cliffWall: ReadonlySet<number>;
  cliffDirs: Partial<Record<number, LedgeStep>>;
  indoorDirs: Map<number, LedgeStep> | null;
}

export type { CliffScan };
