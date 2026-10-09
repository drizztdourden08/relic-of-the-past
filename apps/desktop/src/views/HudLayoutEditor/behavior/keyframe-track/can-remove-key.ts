/* @layer renderer-components @kind logic */
import type { HudAnimationKeyframe } from '@rotp/hud';

const canRemoveKey = (keyframes: readonly HudAnimationKeyframe[]): boolean => keyframes.length > 2;

export { canRemoveKey };
