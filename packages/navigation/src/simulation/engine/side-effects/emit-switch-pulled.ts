/* @layer shared-game @kind logic */
import type { SimEvent, TriggerAction } from '../../types';
import { narrative } from '../event-log/narrative';
import { globalRefresh } from '../explorer/global-refresh';
import type { EngineState } from '../state/state.type';
import { refloodHere } from './reflood-here';
import { settleTrigger } from './settle-trigger';

const emitSwitchPulled = (
  s: EngineState,
  events: SimEvent[],
  key: string,
  action: Extract<TriggerAction, { type: 'pullSwitch' }>,
): void => {
  const { roomId, drain } = action;
  s.done.add(key);
  if (drain) {
    events.push(narrative(s, `Pulled switch (room ${roomId.toString(16)}) and drained screen 0x${drain.screen.toString(16)}`));
    globalRefresh(s);
    events.push(narrative(s, 'Reset: re-exploring with the drained screen open'));
  } else {
    events.push(narrative(s, `Pulled switch (room ${roomId.toString(16)}) and the shutter doors opened`));
    refloodHere(s, events);
  }
  settleTrigger(s);
};

export { emitSwitchPulled };
