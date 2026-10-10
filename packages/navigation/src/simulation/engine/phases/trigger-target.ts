/* @layer shared-game @kind logic */
import type { SimObservation, SimEvent, TriggerAction } from '../../types';
import type { EngineState } from '../state/state.type';
import { cloneSnapshot } from '../../detect/flag-snapshot/clone-snapshot';
import { narrative } from '../event-log/narrative';
import { interceptTrap } from '../side-effects/intercept-trap';

const triggerTarget = (s: EngineState, obs: SimObservation, events: SimEvent[], actions: TriggerAction[]): void => {
  const target = s.currentTarget;
  if (!target) { s.phase = 'observing'; return; }
  if (interceptTrap(s, obs, events, actions)) return;
  s.preTrigger = cloneSnapshot(obs.flags);
  actions.push(target.action);
  events.push(narrative(s, `${target.verb} ${target.noun}`));
  s.phase = 'verifying';
};

export { triggerTarget };
