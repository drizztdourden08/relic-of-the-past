/* @layer renderer-components @kind logic */
import type { HudAnimationKeyframe } from '@rotp/hud';

const trackOrder = (keyframes: readonly HudAnimationKeyframe[]): number[] =>
  [...keyframes.entries()].sort(([, a], [, b]) => a.at - b.at).map(([i]) => i);

export { trackOrder };
