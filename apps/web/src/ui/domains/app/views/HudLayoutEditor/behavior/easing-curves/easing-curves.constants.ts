/* @layer renderer-components @kind constants */
import type { HudNamedEasing } from '@shared/types/hud';

const NAMED_EASINGS: readonly HudNamedEasing[] = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];

const CURVE_BOX = 16;

const CURVE_SAMPLES = 24;

const MIN_STEPS = 1;
const DEFAULT_STEPS = 3;

export { CURVE_BOX, CURVE_SAMPLES, DEFAULT_STEPS, MIN_STEPS, NAMED_EASINGS };
