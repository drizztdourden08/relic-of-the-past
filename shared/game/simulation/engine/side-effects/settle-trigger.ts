/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';

const settleTrigger = (s: EngineState): void => {
  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = 'observing';
};

export { settleTrigger };
