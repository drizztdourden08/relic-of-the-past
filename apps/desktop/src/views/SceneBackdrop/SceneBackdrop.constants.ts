/* @layer renderer-hud @kind constants */
import type { SceneClock } from '../../title/scene/scene.type';

const STILL: SceneClock = { t: 0, drift: 0, moving: false };
const DEFAULT_HORIZON = 0.62;
const DEFAULT_SEED = 7;

export { DEFAULT_HORIZON, DEFAULT_SEED, STILL };
