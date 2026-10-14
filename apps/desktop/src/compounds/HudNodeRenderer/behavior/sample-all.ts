/* @layer renderer-hud @kind logic */
import { sampleAnimation } from '@rotp/hud';
import type { HudAnimation } from '@rotp/hud';
import type { MotionScope, SampledProperties } from './hud-node-motion.type';

const sampleAll = (animations: readonly HudAnimation[], nowMs: number, scope: MotionScope): SampledProperties => {
  const out: SampledProperties = {};
  animations.forEach((animation) => {
    const value = sampleAnimation(animation, nowMs, scope);
    if (value === undefined) return;
    out[animation.property] = value;
  });
  return out;
};

export { sampleAll };
