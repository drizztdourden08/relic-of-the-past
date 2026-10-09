/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { ScreenGridBundle } from '../../types';
import { attrGridsOf } from '../discover-bombs/attr-grids-of';
import { MAX_SEARCH_STEPS, ORTHOGONAL_DIRECTIONS, PROJECTILE_BLOCKED } from './enemy-reach-geometry.constants';
import { isStandable } from './is-standable';

const blocksProjectile = (bundle: ScreenGridBundle, tile: GridPos, collisionTable: number[]): boolean =>
  attrGridsOf(bundle).some((g) => collisionTable[g[tile.row]?.[tile.col] ?? 0] === PROJECTILE_BLOCKED);

const findLineOfFirePosition = (
  target: GridPos,
  travel: number,
  reached: boolean[][] | undefined,
  bundle: ScreenGridBundle | undefined,
  collisionTable: number[] | undefined,
): GridPos | undefined => {
  if (!bundle || !collisionTable) return undefined;
  const maxSteps = Math.min(travel, MAX_SEARCH_STEPS);
  for (const dir of ORTHOGONAL_DIRECTIONS) {
    let blocked = false;
    for (let step = 1; step <= maxSteps; step++) {
      const pos = { row: target.row + dir.row * step, col: target.col + dir.col * step };
      if (!blocked && isStandable(reached, pos)) return pos;
      if (blocksProjectile(bundle, pos, collisionTable)) blocked = true;
    }
  }
  return undefined;
};

export { findLineOfFirePosition };
