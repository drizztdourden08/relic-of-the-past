/* @layer shared-hud @kind logic */
import { cyclePosition } from './cycle-position';
import { gateTruthy } from './gate-truthy';
import { sampleKeyframes } from './sample-keyframes';
import { resolveValue } from '../../data/resolve-value';
import type { HudAnimation } from '../../../types/hud/hud-motion';
import type { Scope } from '../engine.type';

const sampleAnimation = (animation: HudAnimation, elapsedMs: number, scope: Scope): number | undefined => {
  if (animation.when !== undefined && !gateTruthy(animation.when, scope)) return undefined;
  const duration = resolveValue(animation.duration, scope);
  const delay = animation.delay !== undefined ? resolveValue(animation.delay, scope) : 0;
  const t = cyclePosition(elapsedMs, delay, duration, animation.loop);
  return sampleKeyframes(animation.keyframes, t, scope, animation.easing);
};

export { sampleAnimation };
