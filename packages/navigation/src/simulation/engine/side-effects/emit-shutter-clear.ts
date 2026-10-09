/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { narrative } from '../event-log/narrative';
import type { EngineState } from '../state/state.type';
import { refloodHere } from './reflood-here';
import { settleTrigger } from './settle-trigger';

const emitShutterClear = (s: EngineState, events: SimEvent[], label: string, key: string): void => {
  s.done.add(key);
  events.push(narrative(s, `Defeated ${label} and the shutter doors opened`));
  refloodHere(s, events);
  settleTrigger(s);
};

export { emitShutterClear };
