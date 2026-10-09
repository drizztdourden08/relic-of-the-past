/* @layer shared-game @kind data */
import type { RupeeDenomination } from './pond.type';

const RUPEE_DENOMINATIONS: readonly RupeeDenomination[] = [
  { value: 300, itemId: 'item-071', colour: 'gold', decodeKey: 300 },
  { value: 100, itemId: 'item-065', colour: 'silver', decodeKey: 100 },
  { value: 50, itemId: 'item-066', colour: 'violet', decodeKey: 50 },
  { value: 20, itemId: 'item-055', colour: 'red', decodeKey: 1 },
  { value: 5, itemId: 'item-054', colour: 'blue', decodeKey: 1 },
  { value: 1, itemId: 'item-053', colour: 'green', decodeKey: 1 },
];

const POND_GEM_SLOTS = 10;

export { POND_GEM_SLOTS, RUPEE_DENOMINATIONS };
