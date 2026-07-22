/* @layer shared-game @kind logic */
/**
 * Virtual-Link bookkeeping: inventory → reach tokens, consumable dungeon keys,
 * events, and the unlock-reset epoch rule. When a verified check hands over a
 * traversal-affecting item or flag, the epoch advances and the frontier resets
 * so reachability re-floods from the current virtual position.
 */
import type { DetectedCheck } from '../types';
import type { ReachContext } from '../requirements-map';
import { inventoryToReachTokens, affectsTraversal } from '../requirements-map';
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

const addKey = (state: EngineState, dungeon: string): void => {
  state.keys.set(dungeon, (state.keys.get(dungeon) ?? 0) + 1);
};

/**
 * Fold a received item name into inventory + key/big-key tracking. The live game
 * grants generic "Small Key" / "Big Key" without a dungeon suffix; `dungeonHint`
 * (from the matched check) attributes those to the right dungeon.
 */
const applyItem = (state: EngineState, itemName: string, dungeonHint?: string): void => {
  if (itemName.startsWith('Small Key')) {
    const dungeon = dungeonFromKeyItem(itemName) ?? dungeonHint;
    if (dungeon) addKey(state, dungeon);
    return;
  }
  if (itemName.startsWith('Big Key')) {
    const dungeon = dungeonFromKeyItem(itemName) ?? dungeonHint;
    if (dungeon) state.bigKeys.add(dungeon);
    return;
  }
  state.inventory.add(itemName);
  syncReachTokens(state);
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
 */
const onCheckVerified = (state: EngineState, check: DetectedCheck): void => {
  if (check.itemReceived) {
    const dungeonHint = check.matched?.dungeon ? canonicalDungeon(check.matched.dungeon) : undefined;
    applyItem(state, check.itemReceived, dungeonHint);
  }
  if (check.matchedName) state.completedChecks.add(check.matchedName);

  if (affectsTraversal(check.itemReceived, check.evidence)) {
    resetFrontier(state);
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
  addKey,
  applyItem,
  resetFrontier,
  markDoneAndContinue,
  onCheckVerified,
};
