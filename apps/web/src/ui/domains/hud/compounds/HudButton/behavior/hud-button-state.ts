/* @layer renderer-hud @kind logic */
/**
 * Pure state-and-face resolution for `HudButton`, split out of the component
 * so it is testable with no React/DOM involved at all - the same reason
 * `resolve-node-style.ts` sits beside its own `.tsx` renderer instead of
 * inside it.
 */
import type { HudButtonFace, HudButtonSpec, HudButtonState } from '@shared/types/hud';

interface ButtonInputs { pressed?: boolean; held?: boolean; unassigned?: boolean }

/** Priority order: a live press wins over a hold, which wins over
 *  "nothing's bound here right now", which wins over the plain default. */
const stateFor = (inputs: ButtonInputs): HudButtonState => {
  if (inputs.pressed) return 'pressed';
  if (inputs.held) return 'held';
  if (inputs.unassigned) return 'unassigned';
  return 'idle';
};

/** A state with no face of its own falls back to `idle` - the only state
 *  every button must declare. */
const faceFor = (spec: HudButtonSpec, state: HudButtonState): HudButtonFace => spec.states[state] ?? spec.states.idle;

export { faceFor, stateFor };
export type { ButtonInputs };
