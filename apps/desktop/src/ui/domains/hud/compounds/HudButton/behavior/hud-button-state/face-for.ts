/* @layer renderer-hud @kind logic */
import type { HudButtonFace, HudButtonSpec, HudButtonState } from '@rotp/hud';

const faceFor = (spec: HudButtonSpec, state: HudButtonState): HudButtonFace => spec.states[state] ?? spec.states.idle;

export { faceFor };
