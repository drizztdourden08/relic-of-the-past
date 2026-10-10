/* @layer shared-hud @kind logic */
import { easingFn } from '../motion-easing';
import { resolveValue } from '../../data/resolve-value';
import type { HudAnimationKeyframe } from '../../types/hud-motion';
import type { Scope } from '../engine.type';

const segmentAt = (
  sorted: readonly HudAnimationKeyframe[], t: number,
): readonly [HudAnimationKeyframe, HudAnimationKeyframe] | undefined => {
  for (const [i, a] of sorted.entries()) {
    const b = sorted[i + 1];
    if (b !== undefined && t >= a.at && t <= b.at) return [a, b];
  }
  return undefined;
};

const sampleKeyframes = (
  keyframes: readonly HudAnimationKeyframe[], t: number, scope: Scope, fallbackEasing: string | undefined,
): number => {
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  const [first] = sorted;
  const last = sorted[sorted.length - 1];
  if (first === undefined || last === undefined) return 0;
  if (t <= first.at) return resolveValue(first.value, scope);
  if (t >= last.at) return resolveValue(last.value, scope);

  const segment = segmentAt(sorted, t);
  if (segment === undefined) return resolveValue(last.value, scope);
  const [a, b] = segment;
  const span = b.at - a.at;
  const local = span <= 0 ? 1 : (t - a.at) / span;
  const eased = easingFn(a.easing ?? fallbackEasing)(local);
  const va = resolveValue(a.value, scope);
  const vb = resolveValue(b.value, scope);
  return va + (vb - va) * eased;
};

export { sampleKeyframes };
