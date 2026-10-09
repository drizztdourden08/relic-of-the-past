/* @layer tests @kind helper */
import type { SimChest } from '@rotp/navigation';
import { SEWERS_ROOM } from './dungeon-ledger.constants';

const makeChest = (chestIndex: number, opened = false): SimChest => ({
  roomId: SEWERS_ROOM, chestIndex, isBig: false, tile: { row: 10, col: 10 }, posKnown: true, opened,
});

export { makeChest };
