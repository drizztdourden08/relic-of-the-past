/* @layer shared-game @kind logic */
import type { SimEvent, SimObservation, TriggerAction } from '../../types';
import { cloneSnapshot } from '../../detect/flag-snapshot/clone-snapshot';
import { narrative } from '../event-log/narrative';
import type { EngineState, SimTarget } from '../state/state.type';

const trapSlamTarget = (target: SimTarget): SimTarget => {
  const noun = `${target.noun}'s section`;
  return {
    screenId: target.screenId,
    roomId: target.roomId,
    key: `trap:${target.screenId}`,
    role: 'gate',
    action: { type: 'trapShutters', roomId: target.roomId },
    label: noun,
    noun,
    verb: 'Walking into',
  };
};

const interceptTrap = (s: EngineState, obs: SimObservation, events: SimEvent[], actions: TriggerAction[]): boolean => {
  const target = s.currentTarget;
  if (!target?.trap || s.trapClosed.has(target.screenId)) return false;
  s.trapClosed.add(target.screenId);
  s.pending.unshift(target);
  if (target.tile) s.virtual = { ...s.virtual, tile: target.tile };
  s.currentTarget = trapSlamTarget(target);
  s.preTrigger = cloneSnapshot(obs.flags);
  actions.push(s.currentTarget.action);
  events.push(narrative(s, `Walking into ${target.noun}'s section`));
  s.phase = 'verifying';
  return true;
};

export { interceptTrap };
