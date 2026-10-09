/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { dungeonGroupForScreen, dungeonGroupName } from '../../../logic/queries/dungeon-group';
import { narrative } from '../event-log/narrative';
import type { EngineState } from '../state/state.type';

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

export { reopenLedgersFor };
