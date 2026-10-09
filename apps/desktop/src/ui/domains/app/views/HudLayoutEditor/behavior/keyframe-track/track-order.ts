/* @layer renderer-components @kind logic */
import type { HudAnimationKeyframe } from '@shared/types/hud';

const trackOrder = (keyframes: readonly HudAnimationKeyframe[]): number[] =>
  keyframes.map((_unused, i) => i).sort((a, b) => keyframes[a].at - keyframes[b].at);

export { trackOrder };
