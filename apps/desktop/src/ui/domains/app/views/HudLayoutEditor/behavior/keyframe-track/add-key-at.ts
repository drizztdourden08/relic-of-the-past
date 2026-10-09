/* @layer renderer-components @kind logic */
import { sampleKeyframes } from '@shared/hud/engine';
import { clamp01 } from './clamp01';
import { MIN_GAP } from './keyframe-track.constants';
import { round2 } from './round2';
import type { HudAnimationKeyframe, HudEasing } from '@shared/types/hud';
import type { Scope } from './keyframe-track.type';

const addKeyAt = (
  keyframes: readonly HudAnimationKeyframe[], at: number, scope: Scope, easing: HudEasing | undefined,
): { keyframes: HudAnimationKeyframe[]; index: number } | undefined => {
  const target = clamp01(round2(at));
  if (keyframes.some((k) => Math.abs(k.at - target) < MIN_GAP)) return undefined;
  const value = round2(sampleKeyframes(keyframes, target, scope, easing));
  return { keyframes: [...keyframes, { at: target, value }], index: keyframes.length };
};

export { addKeyAt };
