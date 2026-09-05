/* @layer shared-game @kind logic */
/**
 * Virtual-player bookkeeping: inventory -> reach tokens, consumable dungeon
 * keys, events, and the unlock-reset epoch rule. Dungeon identity is a
 * `DungeonId`, never a slug derived from a display name.
 */
import type { DetectedCheck, SimEvent } from '../types';
import type { DungeonId, ItemId } from '../../data';
import { getItem } from '../../data';
import { dungeonForScreen } from '../../logic/queries/dungeon-group';
import type { ReachContext } from '../requirements-map';
import { inventoryToReachTokens, affectsTraversal, tokensForItem } from '../requirements-map';
import { ANY_DUNGEON } from '../dungeon-key-target';
import type { KeyTarget } from '../dungeon-key-target';
import { keyKindOf } from '../key-items';
import { reopenLedgersFor } from './dungeon-ledger-lifecycle';
import type { EngineState } from './state';

/** Rebuild the item-derived traversal tokens from the current inventory. */
const syncReachTokens = (state: EngineState): void => {
  state.reachTokens = inventoryToReachTokens(state.inventory);
};

/** A key is available for a dungeon while its counter is positive; `*` = any. */
const keyAvailable = (state: EngineState, dungeon: KeyTarget): boolean => {
  if (dungeon === ANY_DUNGEON) return [...state.keys.values()].some(n => n > 0);
  return (state.keys.get(dungeon) ?? 0) > 0;
};

const buildReachContext = (state: EngineState): ReachContext => ({
  tokens: state.reachTokens,
  keyAvailable: dungeon => keyAvailable(state, dungeon),
  bigKeys: state.bigKeys,
  events: state.events,
});

/** Spend one small key for a dungeon (consumable). Returns whether one was spent. */
const spendKey = (state: EngineState, dungeon: DungeonId): boolean => {
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

const addKey = (state: EngineState, dungeon: DungeonId): void => {
  state.keys.set(dungeon, (state.keys.get(dungeon) ?? 0) + 1);
};

/**
 * Fold a received item into inventory + key/big-key tracking. The game grants a
 * generic small/big key with no dungeon attached, so `dungeon` (from the matched
 * check, else where the run stands) attributes it; a key with no dungeon to
 * credit is dropped, not guessed. Returns the requirement tokens this grant
 * satisfies, for `reopenLedgersFor`.
 */
const applyItem = (state: EngineState, itemId: ItemId, dungeon?: DungeonId): string[] => {
  const keyKind = keyKindOf(itemId);
  if (keyKind) {
    if (!dungeon) return [];
    if (keyKind === 'small') {
      addKey(state, dungeon);
      return [`smallkey:${dungeon}`];
    }
    state.bigKeys.add(dungeon);
    return [`bigkey:${dungeon}`];
  }
  state.inventory.add(itemId);
  syncReachTokens(state);
  return tokensForItem(itemId);
};

/**
 * Localized refresh after an in-room unlock/kill: new epoch, but ONLY the
 * current screen loses its visited mark. progressSinceEpoch stays set so the
 * exhaustion pass still sweeps everything once at the end.
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
 * Refresh after a change that alters reachability in OTHER screens (the
 * follower tagging along opens the throne room's push-wall passage, far from
 * where she was rescued). Every screen but the current one becomes re-explorable.
 */
const globalRefresh = (state: EngineState): void => {
  state.epoch += 1;
  state.visited = new Set([state.virtual.screenId]);
  state.failed = new Set();
  state.route = [];
  state.frontier = [];
  state.progressSinceEpoch = true;
};

/** Reset the frontier and bump the epoch, so reachability re-floods from here. */
const resetFrontier = (state: EngineState): void => {
  state.epoch += 1;
  state.frontier = [];
  state.route = [];
  state.progressSinceEpoch = false;
  // Visited screens may expose new tiles/targets after this unlock.
  state.visited = new Set();
  // Failed triggers get one retry per epoch.
  state.failed = new Set();
};

const markDoneAndContinue = (state: EngineState, check: DetectedCheck): void => {
  if (check.checkId) state.completedChecks.add(check.checkId);
  state.progressSinceEpoch = true;
};

/**
 * A traversal-affecting unlock resets the frontier and advances the epoch;
 * anything else marks the check done. `events` is optional only for direct-call
 * tests; the live engine always passes it, since a reopened dungeon group is
 * only reviewable through the narrative log.
 */
const onCheckVerified = (state: EngineState, check: DetectedCheck, events: SimEvent[] = []): void => {
  if (check.itemReceived) {
    // Attribute dungeon-less key grants to the matched check's dungeon, or, for
    // unmatched grants like an enemy's key drop, to the dungeon the run stands in.
    const dungeon = check.matched?.dungeonId ?? dungeonForScreen(state.virtual.screenId) ?? undefined;
    const gained = applyItem(state, check.itemReceived, dungeon);
    reopenLedgersFor(state, gained, getItem(check.itemReceived).randomizerName, events);
  }
  if (check.checkId) state.completedChecks.add(check.checkId);

  if (affectsTraversal(check.itemReceived, check.evidence)) {
    localRefresh(state);
    markDoneAndContinue(state, check);
  } else {
    markDoneAndContinue(state, check);
  }
};

export {
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
