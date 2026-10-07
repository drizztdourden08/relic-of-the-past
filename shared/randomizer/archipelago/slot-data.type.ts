/* @layer shared-game @kind types */
/**
 * What the world package hands this game in `Connected.slot_data`: the generated slot's
 * options and the few per-seed values the client needs before play (the two medallion
 * locks, and the values the generator already rolled: pond demands, prices, capacity).
 * Checked on arrival by parseSlotData.
 */

interface RotpPreRolled {
  pondDemands?: unknown;
  shopPrices?: unknown;
  capacity?: unknown;
  /** The npc, pond and world spots the world was built with (deliverable-lists.ts). */
  deliverable?: unknown;
}

interface RotpSlotData {
  worldVersion: string;
  /**
   * The seed the slot's per-seed values derive from (a pond's throw schedule, a random shop
   * draw), as a local placement keeps it. Absent: the room's seed name stands in.
   */
  seed?: string;
  options: Record<string, string | number | boolean>;
  medallions: { mire: string; turtleRock: string };
  preRolled?: RotpPreRolled;
  deathLink: boolean;
}

export type { RotpPreRolled, RotpSlotData };
