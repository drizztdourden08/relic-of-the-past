/* @layer shared-game @kind data */
/**
 * The six gems the game draws for a rupee amount, largest first, each with
 * the receipt id its own art lives under (the same ids rupee_gem_draw.c
 * keys its colour table on). The three small values share one numberless
 * sheet and differ only by palette row; the three large ones each have a
 * sheet of their own, which is why a toss can only show one of them at a
 * time and the decomposition is spawned in volleys.
 */

interface RupeeDenomination {
  /** Rupees this gem is worth. */
  value: number;
  /** Native receipt id of the gem's art. */
  receipt: number;
  /** The colour the gem reads as, for readouts and logs. */
  colour: string;
  /**
   * Gems sharing a key can be drawn together: they come out of one decoded
   * sheet (and, with coloured rupees on, need no different recolour of it).
   */
  decodeKey: number;
}

/** Largest first — the order the greedy decomposition walks. */
const RUPEE_DENOMINATIONS: readonly RupeeDenomination[] = [
  { value: 300, receipt: 0x46, colour: 'gold', decodeKey: 300 },
  { value: 100, receipt: 0x40, colour: 'silver', decodeKey: 100 },
  { value: 50, receipt: 0x41, colour: 'violet', decodeKey: 50 },
  { value: 20, receipt: 0x36, colour: 'red', decodeKey: 1 },
  { value: 5, receipt: 0x35, colour: 'blue', decodeKey: 1 },
  { value: 1, receipt: 0x34, colour: 'green', decodeKey: 1 },
];

/** How many gems the pond can have in the air at once — its own ancilla slots. */
const POND_GEM_SLOTS = 10;

export { POND_GEM_SLOTS, RUPEE_DENOMINATIONS };
export type { RupeeDenomination };
