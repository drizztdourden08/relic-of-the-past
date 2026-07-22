/* @layer shared-game @kind logic */
/**
 * Bridges the two requirement vocabularies the simulator straddles:
 *   - inventory item NAMES (e.g. "Pegasus Boots", "Hammer") from the game
 *   - TraversalRequirement TOKENS (e.g. "boots", "hammer") from the nav data.
 *
 * Also maps connection barrier tags to tokens as a fallback when a connection
 * carries no explicit `ConnectionNavData.requirements`, and evaluates an
 * OR-of-AND RequirementSet against a reach context (tokens + consumable keys +
 * events).
 */
import type { RequirementSet, TraversalRequirement } from '../navigation/nav-data.types';
import type { ConnectionTag } from '../data/connections/tags';
import type { FlagDiff } from './types';
import { LOGIC_REFERENCED_ITEMS } from './logic-item-names';

/** Item name → traversal token. Keys/big-keys are handled separately (consumable / per-dungeon). */
const ITEM_TO_TOKEN: Record<string, TraversalRequirement> = {
  'Power Glove': 'lift.2',
  'Titans Mitts': 'lift.3',
  Hammer: 'hammer',
  'Magic Hammer': 'hammer',
  'Pegasus Boots': 'boots',
  Flippers: 'flippers',
  Hookshot: 'hookshot',
  'Magic Mirror': 'mirror',
  'Moon Pearl': 'moonpearl',
  Flute: 'flute',
  'Activated Flute': 'flute',
  Cape: 'cape',
  'Cane of Byrna': 'byrna',
  'Cane of Somaria': 'somaria',
  Bow: 'bow',
  'Silver Bow': 'bow',
  'Fire Rod': 'firerod',
  'Ice Rod': 'icerod',
  Lamp: 'lamp',
  Bombos: 'bombos',
  Ether: 'ether',
  Quake: 'quake',
  'Book of Mudora': 'book',
  Shovel: 'shovel',
  'Bug Catching Net': 'net',
  Bottle: 'bottle',
};

/**
 * Connection barrier tags → traversal token (fallback when nav.requirements is absent).
 *
 * Unambiguous barriers map to the item token they demand. `barrier:gloves` is
 * lift.2 (rocks need the Power Glove; lift.1 is bare-hands bushes). `barrier:none`
 * is intentionally absent — it adds no requirement.
 *
 * Ambiguous barriers cannot be resolved from an edge alone: `barrier:medallion`
 * is one of Bombos/Ether/Quake depending on the dungeon, `barrier:crystals` needs
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

/** Reach context an OR-of-AND requirement set is evaluated against. */
interface ReachContext {
  /** Item-derived + always-available tokens. */
  tokens: Set<TraversalRequirement>;
  /** Small keys remaining for a dungeon. */
  keyAvailable: (dungeon: string) => boolean;
  /** Big keys possessed, keyed by dungeon. */
  bigKeys: Set<string>;
  /** Observed done events. */
  events: Set<string>;
}

const inventoryToReachTokens = (inventory: Set<string>): Set<TraversalRequirement> => {
  const tokens = new Set<TraversalRequirement>();
  // Base lift is always available (bare hands).
  tokens.add('lift.1');
  for (const name of inventory) {
    const token = ITEM_TO_TOKEN[name];
    if (token) tokens.add(token);
    // Gloves are progressive: Titan's Mitt also grants light-rock lift.
    if (name === 'Titans Mitts') tokens.add('lift.2');
  }
  return tokens;
};

const barrierTagsToRequirements = (tags: readonly ConnectionTag[]): RequirementSet => {
  const group: TraversalRequirement[] = [];
  for (const tag of tags) {
    if (tag === 'barrier:small-key') group.push('smallkey:*');
    else if (tag === 'barrier:big-key') group.push('bigkey:*');
    else {
      const token = BARRIER_TO_TOKEN[tag];
      if (token) group.push(token);
    }
  }
  return group.length > 0 ? [group] : [];
};

const tokenMet = (token: TraversalRequirement, ctx: ReachContext): boolean => {
  if (token.startsWith('smallkey:')) return ctx.keyAvailable(token.slice('smallkey:'.length));
  if (token.startsWith('bigkey:')) return ctx.bigKeys.has(token.slice('bigkey:'.length));
  if (token.startsWith('event:')) return ctx.events.has(token.slice('event:'.length));
  return ctx.tokens.has(token);
};

/** OR-of-AND: an empty set means "no requirements". */
const requirementsMet = (reqSet: RequirementSet, ctx: ReachContext): boolean => {
  if (reqSet.length === 0) return true;
  return reqSet.some(group => group.every(token => tokenMet(token, ctx)));
};

/** True when a received item name can alter reachability or check triggerability. */
const itemAffectsTraversal = (itemName: string): boolean =>
  Boolean(ITEM_TO_TOKEN[itemName]) ||
  itemName.startsWith('Small Key') ||
  itemName.startsWith('Big Key') ||
  LOGIC_REFERENCED_ITEMS.has(itemName);

/** True when a newly received item or flag change can alter reachability. */
const affectsTraversal = (itemName: string | undefined, diff: FlagDiff[]): boolean => {
  if (itemName && itemAffectsTraversal(itemName)) return true;
  // Progress-buffer changes (events, agahnim, rescue) and any door-open change gate traversal.
  return diff.some(d => d.kind === 'progress' || d.kind === 'overworld');
};

export {
  ITEM_TO_TOKEN,
  BARRIER_TO_TOKEN,
  inventoryToReachTokens,
  barrierTagsToRequirements,
  requirementsMet,
  affectsTraversal,
  itemAffectsTraversal,
};
export type { ReachContext };
