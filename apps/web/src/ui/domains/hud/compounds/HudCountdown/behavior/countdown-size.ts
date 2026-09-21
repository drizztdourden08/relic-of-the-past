/* @layer renderer-hud @kind logic */
import { SLICE_SPAN_RATIO } from '../../../primitives/HudPie';
import { PIE_DIAMETER } from '../HudCountdown.constants';

/** Rendered size of the whole pie box for a HUD scale, its empty rim included. */
const countdownSize = (scale: number): number => (PIE_DIAMETER / SLICE_SPAN_RATIO) * scale;

export { countdownSize };
