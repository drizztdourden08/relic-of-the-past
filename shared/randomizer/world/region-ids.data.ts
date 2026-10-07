/* @layer shared-game @kind data */
/**
 * The regions the logic helpers name directly, by id.
 *
 * A region is a record now (`records/regions/`), so these are ids and the collection is what
 * says which place each one is. The comment beside each is the record's own name, for reading;
 * nothing resolves by it.
 */
import type { RegionId } from '@shared/game/data/types/ids';

const REGION = {
  /** Menu: the graph's own root, a place in the rules and nowhere in the game. */
  start: 'region-001',
  /** Good Bee Cave. */
  coldBeeCave: 'region-105',
  /**
   * Potion Shop: the one shop selling unlimited green and blue potions, which is what the
   * magic-extension branch of `can_extend_magic` reaches for.
   */
  potionSeller: 'region-112',
  /**
   * Capacity Upgrade: the fairy's room where a vanilla bomb or arrow family is bought up to its
   * top rung (capacity/capacity-shop.data.ts).
   */
  capacityFairy: 'region-113',
  /** Light World Death Mountain Shop, the one region the reference's bunny pass handles apart. */
  mountainShop: 'region-128',
  /** Desert Palace Main (Outer). */
  desertPalaceOuter: 'region-164',
  /** Turtle Rock (Top): the mountain plateau above the dungeon, not a room in it. */
  turtleRockTop: 'region-055',
  /** Turtle Rock (Second Section). */
  turtleRockSecondSection: 'region-212',
  /** East Dark World. */
  eastDarkWorld: 'region-034',
  /** Big Bomb Shop. */
  bigBombShop: 'region-136',
  /** Blacksmiths Hut. */
  blacksmithsHut: 'region-091',
  /** Sanctuary. */
  sanctuary: 'region-174',
} as const satisfies Record<string, RegionId>;

export { REGION };
