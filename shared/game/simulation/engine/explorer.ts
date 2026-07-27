/* @layer shared-game @kind logic */
/**
 * Virtual-player bookkeeping: inventory → reach tokens, consumable dungeon keys,
 * events, and the unlock-reset epoch rule. When a verified check hands over a
 * traversal-affecting item or flag, the epoch advances and the frontier resets
 * so reachability re-floods from the current virtual position.
 */
import type { DetectedCheck, SimEvent } from '../types';
import { SCREEN_BY_ID } from '../../data/screens';
import type { ReachContext } from '../requirements-map';
import { inventoryToReachTokens, affectsTraversal, ITEM_TO_TOKEN } from '../requirements-map';
import { reopenLedgersFor } from './dungeon-ledger-lifecycle';
import type { EngineState } from './state';

const canonicalDungeon = (name: string): string =>
  name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Extracts the dungeon key from an item name like "Small Key (Eastern Palace)". */
const dungeonFromKeyItem = (itemName: string): string | null => {
  const match = itemName.match(/\(([^)]+)\)/);
  return match ? canonicalDungeon(match[1]) : null;
};

/** Rebuild the item-derived traversal tokens from the current inventory. */
const syncReachTokens = (state: EngineState): void => {
  state.reachTokens = inventoryToReachTokens(state.inventory);
};

/** A key is available for a dungeon while its counter is positive; '*' = any. */
const keyAvailable = (state: EngineState, dungeon: string): boolean => {
  if (dungeon === '*') return [...state.keys.values()].some(n => n > 0);
  return (state.keys.get(dungeon) ?? 0) > 0;
};

const buildReachContext = (state: EngineState): ReachContext => ({
  tokens: state.reachTokens,
  keyAvailable: dungeon => keyAvailable(state, dungeon),
  bigKeys: state.bigKeys,
  events: state.events,
});

/** Spend one small key for a dungeon (consumable). Returns whether one was spent. */
const spendKey = (state: EngineState, dungeon: string): boolean => {
  const remaining = state.keys.get(dungeon) ?? 0;
  if (remaining <= 0) return false;
  state.keys.set(dungeon, remaining - 1);
  return true;
};

/** Spend one small key from whichever dungeon bucket has one (coarse). */
const spendAnyKey = (state: EngineState): void => {
  for (const [dungeon, n] of state.keys) {
    if (n > 0) { state.keys.set(dungeon, n - 1); return; }
  }
};

const addKey = (state: EngineState, dungeon: string): void => {
  state.keys.set(dungeon, (state.keys.get(dungeon) ?? 0) + 1);
};

/**
 * Fold a received item name into inventory + key/big-key tracking. The live game
 * grants generic "Small Key" / "Big Key" without a dungeon suffix; `dungeonHint`
 * (from the matched check) attributes those to the right dungeon. Returns the
 * requirement tokens this grant satisfies, for the dungeon ledger's reopen check
 * (see `reopenLedgersFor`) — the same vocabulary `requirements-map` evaluates.
 */
const applyItem = (state: EngineState, itemName: string, dungeonHint?: string): string[] => {
  if (itemName.startsWith('Small Key')) {
    const dungeon = dungeonFromKeyItem(itemName) ?? dungeonHint;
    if (!dungeon) return [];
    addKey(state, dungeon);
    return [`smallkey:${dungeon}`];
  }
  if (itemName.startsWith('Big Key')) {
    const dungeon = dungeonFromKeyItem(itemName) ?? dungeonHint;
    if (!dungeon) return [];
    state.bigKeys.add(dungeon);
    return [`bigkey:${dungeon}`];
  }
  state.inventory.add(itemName);
  syncReachTokens(state);
  const tokens: string[] = [];
  const token = ITEM_TO_TOKEN[itemName];
  if (token) tokens.push(token);
  if (itemName === 'Titans Mitts') tokens.push('lift.2');
  return tokens;
};

/**
 * Localized refresh after an in-room unlock/kill: new epoch (fresh detects),
 * but ONLY the current screen loses its visited mark — the run re-floods it in
 * place instead of resetting the whole exploration. progressSinceEpoch stays
 * set so the exhaustion pass still sweeps everything once at the end.
 */
const localRefresh = (state: EngineState): void => {
  state.epoch += 1;
  state.visited.delete(state.virtual.screenId);
  state.failed = new Set();
  state.route = [];
  state.frontier = [];
  state.progressSinceEpoch = true;
};

/**
 * Refresh after a change that alters reachability in OTHER screens — the
 * follower tagging along opens the throne room's push-wall passage, far from
 * where she was rescued. Every screen but the current one becomes re-explorable
 * (unlike localRefresh, which only re-floods the room the player stands in).
 */
const globalRefresh = (state: EngineState): void => {
  state.epoch += 1;
  state.visited = new Set([state.virtual.screenId]);
  state.failed = new Set();
  state.route = [];
  state.frontier = [];
  state.progressSinceEpoch = true;
};

/** Reset the frontier and bump the epoch — reachability re-floods from here. */
const resetFrontier = (state: EngineState): void => {
  state.epoch += 1;
  state.frontier = [];
  state.route = [];
  state.progressSinceEpoch = false;
  // Re-explore everything from the current position: previously visited screens
  // may now expose newly reachable tiles/targets after this unlock.
  state.visited = new Set();
  // Failed triggers get one retry per epoch.
  state.failed = new Set();
};

const markDoneAndContinue = (state: EngineState, check: DetectedCheck): void => {
  if (check.matchedName) state.completedChecks.add(check.matchedName);
  state.progressSinceEpoch = true;
};

/**
 * The loop the whole feature hinges on: a traversal-affecting unlock resets the
 * frontier and advances the epoch; anything else simply marks the check done.
 * `events` is optional only so existing direct-call tests need no changes —
 * the live engine always passes it, since a reopened dungeon group is only
 * reviewable through the narrative log.
 */
const onCheckVerified = (state: EngineState, check: DetectedCheck, events: SimEvent[] = []): void => {
  if (check.itemReceived) {
    // Attribute dungeon-less key grants to the matched check's dungeon, or —
    // for unmatched grants like an enemy's key drop — to the current location.
    const location = SCREEN_BY_ID.get(state.virtual.screenId)?.location;
    const hint = check.matched?.dungeon ?? location;
    const gained = applyItem(state, check.itemReceived, hint ? canonicalDungeon(hint) : undefined);
    reopenLedgersFor(state, gained, check.itemReceived, events);
  }
  if (check.matchedName) state.completedChecks.add(check.matchedName);

  if (affectsTraversal(check.itemReceived, check.evidence)) {
    localRefresh(state);
    markDoneAndContinue(state, check);
  } else {
    markDoneAndContinue(state, check);
  }
};

export {
  canonicalDungeon,
  dungeonFromKeyItem,
  syncReachTokens,
  keyAvailable,
  buildReachContext,
  spendKey,
  spendAnyKey,
  addKey,
  localRefresh,
  globalRefresh,
  applyItem,
  resetFrontier,
  markDoneAndContinue,
  onCheckVerified,
};
