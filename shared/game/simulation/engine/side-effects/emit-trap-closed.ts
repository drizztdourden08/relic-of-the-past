/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { narrative } from '../event-log/narrative';
import type { EngineState } from '../state/state.type';
import { refloodHere } from './reflood-here';
import { settleTrigger } from './settle-trigger';

const emitTrapClosed = (s: EngineState, events: SimEvent[], roomId: number): void => {
  events.push(narrative(s, `Shutter doors slammed shut behind the player (room ${roomId.toString(16)})`));
  refloodHere(s, events);
  settleTrigger(s);
};

export { emitTrapClosed };
