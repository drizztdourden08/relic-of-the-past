/* @layer shared-game @kind logic */
import type { SimTarget } from '../state/state.type';

const foundMessage = (target: SimTarget): string =>
  target.tile
    ? `Found ${target.noun} at ${target.tile.col},${target.tile.row}`
    : `Found ${target.noun} (room ${target.roomId.toString(16)})`;

export { foundMessage };
