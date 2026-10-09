/* @layer shared-game @kind logic */
import type { SimExit } from '../../types';
import type { CameFrom } from './regions.type';
import { SAME_DOORWAY_RADIUS } from './regions.constants';
import { arrivalKey } from './arrival-key';

const markWayBackUsed = (arrivals: Set<string>, cameFrom: CameFrom, exits: readonly SimExit[]): void => {
  if (!cameFrom) return;
  for (const exit of exits) {
    if (exit.to !== cameFrom.screenId || !exit.fromTile) continue;
    if (Math.abs(exit.fromTile.row - cameFrom.tile.row) > SAME_DOORWAY_RADIUS) continue;
    if (Math.abs(exit.fromTile.col - cameFrom.tile.col) > SAME_DOORWAY_RADIUS) continue;
    arrivals.add(arrivalKey(exit.to, exit.edgeSig));
  }
};

export { markWayBackUsed };
