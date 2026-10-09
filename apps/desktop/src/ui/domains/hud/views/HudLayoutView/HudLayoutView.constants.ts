/* @layer renderer-hud @kind constants */
import type { DeviceFamily } from '@rotp/game-data';

const CLUSTER_FADE = 'opacity 250ms ease-out';

const FAMILY_PREFIXES: readonly (readonly [string, DeviceFamily])[] = [
  ['switch-', 'nintendo'],
  ['xbox-', 'xbox'],
  ['ps-', 'playstation'],
  ['gc-', 'nintendo'],
];

const REVEAL_MS = 2000;

const CANVAS_ID = 'canvas';

const HEALTH_PER_HEART = 8;
const SILVER_ARROW_TIER = 3;

export { CANVAS_ID, CLUSTER_FADE, FAMILY_PREFIXES, HEALTH_PER_HEART, REVEAL_MS, SILVER_ARROW_TIER };
