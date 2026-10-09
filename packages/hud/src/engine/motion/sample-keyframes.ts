/* @layer shared-hud @kind logic */
import { easingFn } from '../motion-easing';
import { resolveValue } from '../../data/resolve-value';
import type { HudAnimationKeyframe } from '../../types/hud-motion';
import type { Scope } from '../engine.type';

const sampleKeyframes = (
  keyframes: readonly HudAnimationKeyframe[], t: number, scope: Scope, fallbackEasing: string | undefined,
): number => {
  if (keyframes.length === 0) return 0;
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  if (t <= sorted[0].at) return resolveValue(sorted[0].value, scope);
  const last = sorted[sorted.length - 1];
  if (t >= last.at) return resolveValue(last.value, scope);

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (t < a.at || t > b.at) continue;
    const span = b.at - a.at;
    const local = span <= 0 ? 1 : (t - a.at) / span;
    const eased = easingFn(a.easing ?? fallbackEasing)(local);
    const va = resolveValue(a.value, scope);
    const vb = resolveValue(b.value, scope);
    return va + (vb - va) * eased;
  }
  return resolveValue(last.value, scope);
};

export { sampleKeyframes };
