/* @layer renderer-hud @kind logic */
import { SLICE_SPAN_RATIO } from '../../../primitives/HudPie';
import { PIE_DIAMETER } from '../HudCountdown.constants';

const countdownSize = (scale: number): number => (PIE_DIAMETER / SLICE_SPAN_RATIO) * scale;

export { countdownSize };
