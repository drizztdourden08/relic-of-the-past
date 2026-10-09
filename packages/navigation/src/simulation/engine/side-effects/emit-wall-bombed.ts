/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { narrative } from '../event-log/narrative';
import type { EngineState } from '../state/state.type';
import { refloodHere } from './reflood-here';
import { settleTrigger } from './settle-trigger';

const emitWallBombed = (s: EngineState, events: SimEvent[], key: string, label: string): void => {
  s.done.add(key);
  events.push(narrative(s, `Bombed ${label} and the wall opened`));
  refloodHere(s, events);
  settleTrigger(s);
};

export { emitWallBombed };
