/* @layer tests @kind helper */
import type { SimChest } from '../../../shared/game/simulation/types';
import { SEWERS_ROOM } from './dungeon-ledger.constants';

const makeChest = (chestIndex: number, opened = false): SimChest => ({
  roomId: SEWERS_ROOM, chestIndex, isBig: false, tile: { row: 10, col: 10 }, posKnown: true, opened,
});

export { makeChest };
