/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import type { EngineState } from '../state/state.type';
import { narrative } from '../event-log/narrative';
import { screenLabel } from '../screen-label';
import { positionMessage } from '../hop/position-message';

const finishRun = (s: EngineState, events: SimEvent[], outcome: NonNullable<EngineState['outcome']>): void => {
  s.outcome = outcome;
  s.phase = 'done';
  events.push(narrative(s, positionMessage('END', s.virtual.tile)), narrative(s, `Exiting ${screenLabel(s.virtual.screenId)}`), narrative(s, `Run finished: ${outcome}`));
};

export { finishRun };
