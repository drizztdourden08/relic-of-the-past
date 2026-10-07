/* @layer shared-game @kind logic */
/**
 * Closes a dungeon group once nothing in it can be acted on, and reopens an
 * exhausted one when the run acquires something on its `reopensOn` list. This
 * is the ONLY path back into a dungeon group: it hooks the existing
 * frontier-reset-on-item-gain flow (`onCheckVerified` in explorer.ts) instead
 * of adding a second reset mechanism.
 */
import type { SimEvent } from '../types';
import { dungeonGroupForScreen, dungeonGroupName } from '../../logic/queries/dungeon-group';
import { narrative } from './event-log';
import type { EngineState } from './state';

/** True while some part of the group is still reachable or workable this epoch. */
const groupStillLive = (state: EngineState, group: number): boolean => {
  const inGroup = (id: string): boolean => dungeonGroupForScreen(id) === group;
  return inGroup(state.virtual.screenId)
    || state.pending.some(t => inGroup(t.screenId))
    || state.frontier.some(inGroup)
    || state.regionJobs.some(j => inGroup(j.to));
};

/** Settle every ledger the run has nothing left to do in right now: `complete`
 *  when its owed list is empty, `exhausted` (with reopen requirements) otherwise. */
const closeIdleDungeonGroups = (state: EngineState, events: SimEvent[]): void => {
  for (const ledger of state.ledgers.values()) {
    if (ledger.complete || ledger.exhausted) continue;
    if (groupStillLive(state, ledger.group)) continue;

    if (ledger.owed.length === 0) {
      ledger.complete = true;
      events.push(narrative(state, `${dungeonGroupName(ledger.group)} complete. Nothing left owed, will not be re-entered`));
      continue;
    }
    ledger.exhausted = true;
    ledger.reopensOn = [...new Set(
      ledger.owed.map(o => o.blockedBy).filter((t): t is string => Boolean(t)),
    )];
    const reasons = ledger.reopensOn.length > 0 ? ledger.reopensOn.join(', ') : 'unknown reasons';
    events.push(narrative(state, `${dungeonGroupName(ledger.group)} exhausted: ${ledger.owed.length} check(s) still owed, blocked by ${reasons}`));
  }
};

/**
 * Reopen every exhausted group whose `reopensOn` includes one of the tokens
 * just gained. Un-visiting the group's own screens is enough, because the discovered
 * graph already has their edges, so the next frontier computation offers them
 * again without a full exploration reset.
 */
const reopenLedgersFor = (state: EngineState, tokens: string[], itemLabel: string, events: SimEvent[]): void => {
  if (tokens.length === 0) return;
  for (const ledger of state.ledgers.values()) {
    if (!ledger.exhausted || !ledger.reopensOn.some(t => tokens.includes(t))) continue;
    ledger.exhausted = false;
    ledger.reopensOn = [];
    for (const id of [...state.visited]) {
      if (dungeonGroupForScreen(id) === ledger.group) state.visited.delete(id);
    }
    events.push(narrative(state, `${dungeonGroupName(ledger.group)} reopening after acquiring ${itemLabel}`));
  }
};

/** True when this screen belongs to a group already settled as complete. Such a
 *  group owes nothing, so nothing there is worth walking back to. */
const inCompletedGroup = (state: EngineState, screenId: string): boolean => {
  const group = dungeonGroupForScreen(screenId);
  if (group == null) return false;
  return state.ledgers.get(group)?.complete === true;
};

export { closeIdleDungeonGroups, reopenLedgersFor, inCompletedGroup };
