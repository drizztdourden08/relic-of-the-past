/* @layer shared-game @kind data */
/**
 * Bridges the two requirement vocabularies the simulator straddles:
 *   - the items an inventory holds, as `ItemId`s
 *   - TraversalRequirement TOKENS (e.g. "boots", "hammer") from the nav data.
 *
 * `ITEM_TO_TOKEN` is keyed by `ItemId`. It used to be keyed by display name,
 * which silently dropped two rows: no record is named "Bombs" (the pickup is
 * `item-041`) and none is named "Magic Hammer" at all, so both keys matched
 * nothing and the tokens they claimed to grant were unreachable.
 *
 * `IMPLIED_TOKENS` carries progression between tokens, which is what removes the
 * old per-item glove special case: the mitt grants `lift.3`, and a run holding
 * `lift.3` holds every rung under it. The rungs are a property of the tokens, not
 * of one item's name — no `ItemRecord.tier` is involved, and only swords and
 * shields carry a tier anyway.
 *
 * `BARRIER_TO_TOKEN` maps connection barrier tags to tokens as a fallback when a
 * connection carries no explicit `ConnectionNavData.requirements`.
 */
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import type { ConnectionTag } from '../taxonomy/connection-tags';
import type { ItemId } from '../types/ids';

/**
 * Item → traversal token. Keys/big-keys are handled separately (consumable /
 * per-dungeon), so no key record appears here.
 *
 * `item-059` and `item-012` are two distinct records that share the display name
 * "Bow"; both grant the token, because either one in hand means the run can shoot.
 */
const ITEM_TO_TOKEN: Partial<Record<ItemId, TraversalRequirement>> = {
  // Bombs are a traversal item, not just a consumable. One interior tile attr is a
  // bombable wall (`req: 'bombs'`), and without this entry the token never reached
  // the flood at all — so the wall stayed shut forever — AND receiving bombs did
  // not count as traversal-affecting, so a wall already seen was never
  // re-evaluated once they arrived. The well's own chests hand over the bombs that
  // open its top room, so both halves have to work for that chest to be reachable.
  // No record expresses bomb CAPACITY, so the pickup stands in for "carries bombs".
  'item-041': 'bombs',
  'item-028': 'lift.2',
  'item-029': 'lift.3',
  'item-010': 'hammer',
  'item-076': 'boots',
  'item-031': 'flippers',
  'item-011': 'hookshot',
  'item-027': 'mirror',
  'item-032': 'moonpearl',
  'item-021': 'flute',
  'item-075': 'flute',
  'item-026': 'cape',
  'item-025': 'byrna',
  'item-022': 'somaria',
  'item-012': 'bow',
  'item-059': 'bow',
  'item-060': 'bow',
  'item-008': 'firerod',
  'item-009': 'icerod',
  'item-019': 'lamp',
  'item-016': 'bombos',
  'item-017': 'ether',
  'item-018': 'quake',
  'item-030': 'book',
  'item-020': 'shovel',
  'item-034': 'net',
  'item-023': 'bottle',
};

/**
 * Progressive tokens: holding a token implies holding everything it lists.
 *
 * Only the lift rungs are progressive today. The base rung is bare hands, which
 * every run has from the start, so it is granted unconditionally rather than
 * listed here.
 */
const IMPLIED_TOKENS: Partial<Record<TraversalRequirement, readonly TraversalRequirement[]>> = {
  'lift.3': ['lift.2', 'lift.1'],
  'lift.2': ['lift.1'],
};

/**
 * Connection barrier tags → traversal token (fallback when nav.requirements is absent).
 *
 * Unambiguous barriers map to the item token they demand. `barrier:gloves` is
 * lift.2 (rocks need the second lift rung; lift.1 is bare-hands bushes). `barrier:none`
 * is intentionally absent — it adds no requirement.
 *
 * Ambiguous barriers cannot be resolved from an edge alone: `barrier:medallion`
 * is one of three medallions depending on the dungeon, `barrier:crystals` needs
 * a crystal count, `barrier:event` a specific story flag, and `barrier:glitch` a
 * glitch we never route. Each maps to an impossible `event:unmapped-barrier-*`
 * token so the edge BLOCKS until the connections dataset supplies real
 * `nav.requirements`.
 */
const BARRIER_TO_TOKEN: Partial<Record<ConnectionTag, TraversalRequirement>> = {
  'barrier:gloves': 'lift.2',
  'barrier:hammer': 'hammer',
  'barrier:dash': 'boots',
  'barrier:hookshot': 'hookshot',
  'barrier:swim': 'flippers',
  'barrier:fire': 'firerod',
  'barrier:book': 'book',
  'barrier:dark': 'lamp',
  'barrier:bomb': 'bombs',
  'barrier:medallion': 'event:unmapped-barrier-medallion',
  'barrier:crystals': 'event:unmapped-barrier-crystals',
  'barrier:event': 'event:unmapped-barrier-event',
  'barrier:glitch': 'event:unmapped-barrier-glitch',
};

export { ITEM_TO_TOKEN, IMPLIED_TOKENS, BARRIER_TO_TOKEN };
