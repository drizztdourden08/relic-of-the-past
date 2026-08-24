/* @layer shared-asset-extraction @kind data */
/**
 * Which header slot each staircase must claim, measured on the original hardware.
 *
 * A staircase's destination is the header slot named by the slot attribute the engine derives
 * for it, and that attribute is decided by the order stair objects register across the
 * engine's stair buckets — information the baked maps do not carry. These are the observed
 * facts: the game was run on original hardware with a memory tracer attached, each staircase
 * was walked, and the arrival room identifies the slot because the header's destinations are
 * independently known to be correct.
 *
 * Each requirement names the cell region where the engine writes the staircase's slot
 * attribute and the exact value measured behaviour demands: low two bits the slot, bit two
 * the direction family (set walks the player down into the destination, clear up). The
 * solver searches stair variants and orderings until the engine's own derivation, replayed
 * over the candidate stream, produces these values.
 *
 * Rooms are absent until their staircases have been measured; an absent room keeps whatever
 * the art-driven solve produced.
 */

interface StairSlotRequirement {
  /** Centre of the region the slot attribute must appear in (attribute grid cells). */
  row: number;
  col: number;
  /** The exact slot attribute: 0x30+slot walks up on arrival, 0x34+slot walks down. */
  attr: number;
}

const MEASURED_STAIR_SLOTS: Readonly<Record<number, readonly StairSlotRequirement[]>> = {
  // The hub. North-west and north-east both lead to the antechamber (header slots 0 and 1),
  // the north-centre staircase to the east wing (slot 3), and all three walk the player down
  // into the destination. Slot 2 is the west wall's teleport door, not a floor staircase, so
  // the room's fourth staircase (bottom-centre) has to be the one that consumes it.
  0x78: [
    { row: 4, col: 15, attr: 0x34 },
    { row: 4, col: 47, attr: 0x35 },
    { row: 4, col: 31, attr: 0x37 },
  ],
};

export { MEASURED_STAIR_SLOTS };
export type { StairSlotRequirement };
