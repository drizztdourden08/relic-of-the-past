/* @layer shared-game @kind logic */
/**
 * Turns what a run HOLDS into the TraversalRequirement tokens the nav data gates
 * on, maps connection barrier tags to tokens as a fallback when a connection
 * carries no explicit `ConnectionNavData.requirements`, and evaluates an
 * OR-of-AND RequirementSet against a reach context (tokens + consumable keys +
 * events).
 *
 * The item side is `ItemId` throughout; the table itself lives in
 * `data/native-tables/traversal-tokens.ts`.
 */
import type { RequirementSet, TraversalRequirement } from '../navigation/nav-data.types';
import type { ConnectionTag, DungeonId, ItemId } from '../data';

import type { FlagDiff } from './types';
import { LOGIC_REFERENCED_ITEMS } from './logic-referenced-items';
import { ITEM_TO_TOKEN, IMPLIED_TOKENS, BARRIER_TO_TOKEN } from '../data/native-tables';
import { keyKindOf } from './key-items';
import { ANY_DUNGEON, keyTargetOf } from './dungeon-key-target';
import type { KeyTarget } from './dungeon-key-target';

/** Reach context an OR-of-AND requirement set is evaluated against. */
interface ReachContext {
  /** Item-derived + always-available tokens. */
  tokens: ReadonlySet<TraversalRequirement>;
  /** Small keys remaining for a dungeon, or for any dungeon at all. */
  keyAvailable: (dungeon: KeyTarget) => boolean;
  /** Big keys possessed, by dungeon. */
  bigKeys: ReadonlySet<DungeonId>;
  /** Observed done events. */
  events: ReadonlySet<string>;
}

/** Every token an item grants, including the rungs a progressive token implies. */
const tokensForItem = (itemId: ItemId): TraversalRequirement[] => {
  const token = ITEM_TO_TOKEN[itemId];
  if (!token) return [];
  return [token, ...(IMPLIED_TOKENS[token] ?? [])];
};

const inventoryToReachTokens = (inventory: ReadonlySet<ItemId>): Set<TraversalRequirement> => {
  const tokens = new Set<TraversalRequirement>();
  // Base lift is always available (bare hands).
  tokens.add('lift.1');
  for (const itemId of inventory) {
    for (const token of tokensForItem(itemId)) tokens.add(token);
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

/**
 * `bigkey:*` is UNSATISFIABLE here, on purpose, and that is a known defect rather
 * than a rule: the barrier tag says "this crossing wants the big key" without
 * saying whose, and a wildcard big key has no meaning for a per-dungeon set. It
 * used to read `bigKeys.has('*')`, which is the same answer written as if it were
 * a lookup; typing the set by `DungeonId` is what makes it impossible to write
 * that line without admitting it. The 12 connections tagged `barrier:big-key` are
 * therefore impassable on the STATIC graph — unchanged from before this re-typing,
 * and deliberately not "fixed" here, because unblocking them changes what the
 * simulator can reach and belongs in its own verified change. Note the engine's
 * own big-key DOOR handling is already coarse (`bigKeys.size === 0` in
 * discover.ts), which is the evidence that the mismatch is an oversight.
 */
const bigKeyMet = (suffix: string, ctx: ReachContext): boolean => {
  const target = keyTargetOf(suffix);
  return target !== null && target !== ANY_DUNGEON && ctx.bigKeys.has(target);
};

const tokenMet = (token: TraversalRequirement, ctx: ReachContext): boolean => {
  if (token.startsWith('smallkey:')) {
    const target = keyTargetOf(token.slice('smallkey:'.length));
    return target !== null && ctx.keyAvailable(target);
  }
  if (token.startsWith('bigkey:')) return bigKeyMet(token.slice('bigkey:'.length), ctx);
  if (token.startsWith('event:')) return ctx.events.has(token.slice('event:'.length));
  return ctx.tokens.has(token);
};

/** OR-of-AND: an empty set means "no requirements". */
const requirementsMet = (reqSet: RequirementSet, ctx: ReachContext): boolean => {
  if (reqSet.length === 0) return true;
  return reqSet.some(group => group.every(token => tokenMet(token, ctx)));
};

/** True when a received item can alter reachability or check triggerability. */
const itemAffectsTraversal = (itemId: ItemId): boolean =>
  ITEM_TO_TOKEN[itemId] !== undefined
  || keyKindOf(itemId) !== null
  || LOGIC_REFERENCED_ITEMS.has(itemId);

/** True when a newly received item or flag change can alter reachability. */
const affectsTraversal = (itemId: ItemId | undefined, diff: FlagDiff[]): boolean => {
  if (itemId && itemAffectsTraversal(itemId)) return true;
  // Progress-buffer changes (events, agahnim, rescue) and any door-open change gate traversal.
  return diff.some(d => d.kind === 'progress' || d.kind === 'overworld');
};

export {
  ITEM_TO_TOKEN,
  BARRIER_TO_TOKEN,
  inventoryToReachTokens,
  tokensForItem,
  barrierTagsToRequirements,
  requirementsMet,
  affectsTraversal,
  itemAffectsTraversal,
};
export type { ReachContext };
