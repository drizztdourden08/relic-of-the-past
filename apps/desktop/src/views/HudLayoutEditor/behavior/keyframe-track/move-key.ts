/* @layer renderer-components @kind logic */
import { clampAt } from './clamp-at';
import type { HudAnimationKeyframe } from '@rotp/hud';

const moveKey = (
  keyframes: readonly HudAnimationKeyframe[], index: number, at: number,
): HudAnimationKeyframe[] =>
  keyframes.map((k, i) => (i === index ? { ...k, at: clampAt(keyframes, index, at) } : k));

export { moveKey };
