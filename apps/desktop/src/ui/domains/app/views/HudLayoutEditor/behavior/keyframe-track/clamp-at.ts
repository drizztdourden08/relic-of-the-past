/* @layer renderer-components @kind logic */
import { clamp01 } from './clamp01';
import { MIN_GAP } from './keyframe-track.constants';
import { round2 } from './round2';
import { trackOrder } from './track-order';
import type { HudAnimationKeyframe } from '@rotp/hud';

const clampAt = (keyframes: readonly HudAnimationKeyframe[], index: number, at: number): number => {
  const order = trackOrder(keyframes);
  const pos = order.indexOf(index);
  if (pos < 0) return clamp01(round2(at));
  const lower = pos > 0 ? keyframes[order[pos - 1]].at + MIN_GAP : 0;
  const upper = pos < order.length - 1 ? keyframes[order[pos + 1]].at - MIN_GAP : 1;
  return clamp01(round2(Math.min(Math.max(at, lower), Math.max(lower, upper))));
};

export { clampAt };
