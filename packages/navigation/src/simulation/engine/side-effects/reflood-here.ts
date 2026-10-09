/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { screenLabel } from '../screen-label';
import { narrative } from '../event-log/narrative';
import { localRefresh } from '../explorer/local-refresh';
import type { EngineState } from '../state/state.type';

const refloodHere = (s: EngineState, events: SimEvent[]): void => {
  localRefresh(s);
  events.push(narrative(s, `Reset: re-flooding ${screenLabel(s.virtual.screenId)} with new state`));
};

export { refloodHere };
