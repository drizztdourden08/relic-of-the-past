/* @layer shared-game @kind logic */
/**
 * Tile geometry for enemy reach: whether the player's 2x2 footprint fits at a
 * tile, and whether a ranged weapon has a clear orthogonal line from a
 * candidate tile to a target. Diagonal firing lines are not modelled for any
 * weapon, including the boomerang's longer diagonal range.
 */
import type { GridPos } from '../../navigation/types';
import type { ScreenGridBundle } from '../types';
import type { Weapon } from './enemy-reach';

/** How far a firing-line search walks before giving up (the flood grid is 64x64). */
const MAX_SEARCH_STEPS = 64;

const ORTHOGONAL_DIRECTIONS: readonly GridPos[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

/** True when the player's whole 2x2 footprint at `tile` is flood-reached. */
const isStandable = (reached: boolean[][] | undefined, tile: GridPos): boolean =>
  !!reached
  && reached[tile.row]?.[tile.col] === true
  && reached[tile.row]?.[tile.col + 1] === true
  && reached[tile.row + 1]?.[tile.col] === true
  && reached[tile.row + 1]?.[tile.col + 1] === true;

/** Attrs at a tile across every layer grid available for the room (a split-level
 *  room keeps floor on the per-layer grids, not just the raw one). */
const attrsAt = (bundle: ScreenGridBundle, tile: GridPos): number[] => {
  const grids = bundle.dualLayerGrids
    ? [bundle.rawAttrGrid, bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1]
    : [bundle.rawAttrGrid];
  return grids.map((g) => g[tile.row]?.[tile.col] ?? 0);
};

/** Blocked when any layer's attr at this tile is a blocking projectile collision. */
const blocksProjectile = (bundle: ScreenGridBundle, tile: GridPos, collisionTable: number[]): boolean =>
  attrsAt(bundle, tile).some((attr) => collisionTable[attr] === 1);

/** A standable tile within contact radius of `target`, or undefined if none. */
const findContactPosition = (target: GridPos, reached: boolean[][] | undefined, radius: number): GridPos | undefined => {
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const pos = { row: target.row + dr, col: target.col + dc };
      if (isStandable(reached, pos)) return pos;
    }
  }
  return undefined;
};

/**
 * A standable tile along an orthogonal ray from `target`, within `travel`
 * tiles, with every tile strictly between it and `target` passable for a
 * projectile. Undefined when no attr grid is available (the line can't be
 * verified) or no such tile exists.
 */
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

/** A firing position for `weapon` against `target`, dispatching on its reach kind. */
const findPositionFor = (
  weapon: Weapon,
  target: GridPos,
  reached: boolean[][] | undefined,
  bundle: ScreenGridBundle | undefined,
  collisionTable: number[] | undefined,
): GridPos | undefined =>
  weapon.kind === 'contact'
    ? findContactPosition(target, reached, weapon.travel)
    : findLineOfFirePosition(target, weapon.travel, reached, bundle, collisionTable);

export { isStandable, findContactPosition, findLineOfFirePosition, findPositionFor };
