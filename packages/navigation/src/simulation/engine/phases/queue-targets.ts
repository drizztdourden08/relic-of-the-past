/* @layer shared-game @kind logic */
import type { SimObservation, SimEvent } from '../../types';
import type { EngineState } from '../state/state.type';
import { discoverTargets } from '../discover/discover-targets';
import { narrative } from '../event-log/narrative';
import { foundMessage } from '../hop/found-message';
import { updateDungeonLedger } from '../dungeon-ledger-scan';

const queueTargets = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
  const targets = discoverTargets(s, obs, obs.reached);
  for (const target of targets) {
    if (!s.pending.some(t => t.key === target.key)) {
      s.pending.push(target);
      events.push(narrative(s, foundMessage(target)));
    }
  }
  updateDungeonLedger(s, obs, targets);
};

export { queueTargets };
