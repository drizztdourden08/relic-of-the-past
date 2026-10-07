/* @layer shared-game @kind data */
/**
 * The facts an item demand's eligibility is read from (pond-demand-eligibility.ts).
 *
 * The fairy names an item and the player throws it in as proof, and the core
 * only tests POSSESSION of the item's resolved receive id. So a demand may
 * only name something the player keeps in hand once found, and whose id the
 * core can test on its own. Everything else stays out, each for its reason:
 *
 *   junk category        rupee pickups, bomb and arrow pickups, a single
 *                        arrow: they are spent into a counter, nothing is held.
 *   upgrade category     pieces of heart, heart containers, magic upgrades
 *                        and every capacity step, wallets included: each one
 *                        raises a limit and leaves nothing to hold up.
 *   bottle category      a bottle and every content: the bottle demand is its
 *                        own kind, with its own row.
 *   key category         small keys are spent on doors. A big key, a map or a
 *                        compass resolves to one plain id for every dungeon,
 *                        so the core cannot tell which dungeon it came from.
 *   event category       triforce pieces and the event items: never held.
 *   a family tier name   the inventory keeps only the highest rung reached,
 *                        so a named lower rung cannot be told from a higher
 *                        one. The family's own pool item is eligible: the
 *                        core reads it as "tier 1 or more".
 *   no native id         a record with no receive id the native tables hold
 *                        (Silver Arrows, the alternate retro bow) is nothing
 *                        the core can test.
 *
 * The self-lock needs no row here. It keeps the named item off the rung that
 * asks for it, which is a placement rule applied after this roll, and every
 * pool item has other locations to go to, so it never removes a candidate.
 */
import type { ItemCategory } from '@shared/game/data/taxonomy/item-categories';

/** The record categories whose members stay in the player's hands once found. */
const HOLDABLE_CATEGORIES: ReadonlySet<ItemCategory> = new Set<ItemCategory>(['equipment', 'weapon', 'medallion']);

/**
 * Holdable-looking items the player can still lose, by pool name, with why.
 * The game keeps ONE inventory byte for each of three pairs, so picking up
 * one of a pair writes over the other, and the witch takes the mushroom.
 */
const UNHELD_ITEMS: ReadonlyMap<string, string> = new Map([
  ['Shovel', 'shares its inventory byte with the Flute, which replaces it'],
  ['Flute', 'shares its inventory byte with the Shovel, which replaces it'],
  ['Mushroom', 'the witch takes it, and it shares its byte with the Magic Powder'],
  ['Magic Powder', 'shares its inventory byte with the Mushroom'],
  ['Blue Boomerang', 'shares its inventory byte with the Red Boomerang, which replaces it'],
  ['Red Boomerang', 'shares its inventory byte with the Blue Boomerang, which replaces it'],
]);

export { HOLDABLE_CATEGORIES, UNHELD_ITEMS };
