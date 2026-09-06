/* @layer renderer-hooks @kind constants */
/**
 * The option keys a tab claims by NAME, not by catalog section. The
 * reference project files these rows under sections this app does not follow,
 * the traps sit in its item section, the scenery shuffles in its enemy one,
 * and the doorways, the trick knowledge and the two entrance requirements all
 * sit in its single world one, so the tab that owns each subject names its
 * rows here instead of inheriting a section that would scatter them.
 *
 * Every set is read by one rule (option-tab-model.ts) and nothing else, so a
 * row changes tab by moving between these sets and by nothing else.
 */
import {
  CAPACITY_BONUS_KEYS, CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY,
} from '@shared/randomizer/ap-world/capacity';
import { POND_OPTION_KEYS } from '@shared/randomizer/ap-world/pond/pond-option-keys';
import { MEDALLION_OPTION_KEYS } from '@shared/randomizer/ap-world/options.data';

/** Everything the wishing pond block owns, its mode row included. */
const POND_KEYS: ReadonlySet<string> = new Set(POND_OPTION_KEYS);

/** The two switches the capacity block owns beside the family rows, and the pickup-bonus rows drawn on them. */
const CAPACITY_BLOCK_KEYS: ReadonlySet<string> = new Set([
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, ...CAPACITY_BONUS_KEYS,
]);

/** Rows that turn a pickup into a nasty surprise, wherever the reference files them. */
const TRAP_KEYS: ReadonlySet<string> = new Set(['beemizer_total_chance', 'beemizer_trap_chance']);

/** World-content shuffles: what the scenery, the floors and the drops hold. */
const ENVIRONMENT_KEYS: ReadonlySet<string> = new Set([
  'shuffle_prizes', 'pot_shuffle', 'bush_shuffle', 'tile_shuffle',
]);

/**
 * Where the doorways lead: the shuffle itself, the number two players share to
 * get the same doorways, and the hand-written connection list that would
 * override both.
 */
const ENTRANCE_KEYS: ReadonlySet<string> = new Set([
  'entrance_shuffle', 'entrance_shuffle_seed', 'plando_connections',
]);

/** How much trick knowledge the seed may expect, and the boots it would hand out for it. */
const GLITCH_KEYS: ReadonlySet<string> = new Set(['glitches_required', 'glitch_boots']);

/**
 * What the player already holds when the game begins, and what the pool
 * therefore stops holding. The reference files it with the plando rows because
 * all three are written out instead of chosen, but the question it asks is
 * about ITEMS, so the items tab claims it by name.
 */
const ITEM_KEYS: ReadonlySet<string> = new Set(['start_inventory_from_pool']);

/**
 * What a merchant tells you before you pay. The reference files it with the
 * hints, since both are about text; the thing it changes is a shop.
 */
const SHOP_KEYS: ReadonlySet<string> = new Set(['scams']);

/**
 * The medallion each sealed entrance asks for. They read as world rows in the
 * reference, but the thing they gate is a dungeon, so they belong beside the
 * rest of what that dungeon asks of the player.
 */
const MEDALLION_KEYS: ReadonlySet<string> = new Set(MEDALLION_OPTION_KEYS);

export {
  CAPACITY_BLOCK_KEYS,
  ENTRANCE_KEYS,
  ENVIRONMENT_KEYS,
  GLITCH_KEYS,
  ITEM_KEYS,
  MEDALLION_KEYS,
  POND_KEYS,
  SHOP_KEYS,
  TRAP_KEYS,
};
