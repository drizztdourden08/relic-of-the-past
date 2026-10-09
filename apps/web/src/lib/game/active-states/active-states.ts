/* @layer bridge-wasm @kind logic */
import type { ActiveState, StateSnapshot } from './active-states.type';
import { stateRules } from './state-rules';

const activeStates = (snap: StateSnapshot): ActiveState[] =>
  stateRules.map((rule) => rule(snap)).filter((s): s is ActiveState => s !== null);

export { activeStates };
