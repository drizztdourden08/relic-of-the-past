/* @layer shared-game @kind data */
/**
 * The six gems the game draws for a rupee amount, largest first, each naming the
 * item record whose art it is. The three small values share one numberless sheet
 * and differ only by palette row; the three large ones each have a sheet of their
 * own, which is why a toss can only show one of them at a time and the
 * decomposition is spawned in volleys.
 *
 * The native receipt id is NOT here: it is the item record's own
 * `gameId.receiveItemId`, the same number rupee_gem_draw.c keys its colour table
 * on, and this file used to carry a second copy of all six.
 */
import type { ItemId } from '@shared/game/data/types/ids';

interface RupeeDenomination {
  /** Rupees this gem is worth. */
  value: number;
  /** The item record this gem is the art of. */
  itemId: ItemId;
  /** The colour the gem reads as, for readouts and logs. */
  colour: string;
  /**
   * Gems sharing a key can be drawn together: they come out of one decoded
   * sheet (and, with coloured rupees on, need no different recolour of it).
   */
  decodeKey: number;
}

/** Largest first: the order the greedy decomposition walks. */
const RUPEE_DENOMINATIONS: readonly RupeeDenomination[] = [
  { value: 300, itemId: 'item-071', colour: 'gold', decodeKey: 300 },
  { value: 100, itemId: 'item-065', colour: 'silver', decodeKey: 100 },
  { value: 50, itemId: 'item-066', colour: 'violet', decodeKey: 50 },
  { value: 20, itemId: 'item-055', colour: 'red', decodeKey: 1 },
  { value: 5, itemId: 'item-054', colour: 'blue', decodeKey: 1 },
  { value: 1, itemId: 'item-053', colour: 'green', decodeKey: 1 },
];

/** How many gems the pond can have in the air at once: its own ancilla slots. */
const POND_GEM_SLOTS = 10;

export { POND_GEM_SLOTS, RUPEE_DENOMINATIONS };
export type { RupeeDenomination };
