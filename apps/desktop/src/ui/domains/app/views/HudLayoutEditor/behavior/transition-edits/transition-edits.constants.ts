/* @layer renderer-components @kind constants */
import type { HudTransitionProperty } from '@rotp/hud';

const TRANSITION_PROPERTIES: readonly HudTransitionProperty[] = [
  'size', 'position', 'opacity', 'scale', 'tint', 'color',
];

const DEFAULT_DURATION = 200;

export { DEFAULT_DURATION, TRANSITION_PROPERTIES };
