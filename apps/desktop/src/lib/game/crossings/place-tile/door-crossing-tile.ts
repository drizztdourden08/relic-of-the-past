/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { ASSUMED_DEPTH, INWARD } from './place-tile.constants';
import { clampToGrid } from './clamp-to-grid';
import { isReached } from './is-reached';
import { measuredLanding } from './measured-landing';
import type { DoorRecord } from './place-tile.type';

const assumedLanding = (door: DoorRecord): GridPos => clampToGrid({
  row: door.row + INWARD[door.direction].row * ASSUMED_DEPTH,
  col: door.col + INWARD[door.direction].col * ASSUMED_DEPTH,
});

const doorCrossingTile = (
  door: DoorRecord,
  reachable: readonly ReachState[][] | undefined,
  fallback?: GridPos,
): GridPos => {
  const from = { row: door.row, col: door.col };
  if (isReached(reachable, from.row, from.col)) return from;
  return measuredLanding(from, door.direction, reachable) ?? fallback ?? assumedLanding(door);
};

export { doorCrossingTile };
