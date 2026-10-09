/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';

const frontierExhausted = (s: EngineState): boolean =>
  s.frontier.length === 0 && s.pending.length === 0 && s.route.length === 0 && !s.currentTarget;

export { frontierExhausted };
