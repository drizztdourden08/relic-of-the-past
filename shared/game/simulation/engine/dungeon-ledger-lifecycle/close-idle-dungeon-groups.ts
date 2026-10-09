/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { dungeonGroupForScreen, dungeonGroupName } from '../../../logic/queries/dungeon-group';
import { narrative } from '../event-log/narrative';
import type { EngineState } from '../state/state.type';

const groupStillLive = (state: EngineState, group: number): boolean => {
  const inGroup = (id: string): boolean => dungeonGroupForScreen(id) === group;
  return inGroup(state.virtual.screenId)
    || state.pending.some(t => inGroup(t.screenId))
    || state.frontier.some(inGroup)
    || state.regionJobs.some(j => inGroup(j.to));
};

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

export { closeIdleDungeonGroups };
