/* @layer shared-hud @kind logic */
import { bakeGate } from './bake-gate';
import { bakeValue } from './bake-value';
import type { HudAnimation } from '../../../types/hud/hud-motion';
import type { Value } from '../../../types/hud/hud-value';
import type { Scope } from '../engine.type';

const bakeAnimation = (animation: HudAnimation, scope: Scope): HudAnimation => ({
  ...animation,
  ...(animation.when !== undefined ? { when: bakeGate(animation.when, scope) } : {}),
  duration: bakeValue(animation.duration, scope) as Value,
  ...(animation.delay !== undefined ? { delay: bakeValue(animation.delay, scope) } : {}),
  keyframes: animation.keyframes.map((k) => ({ ...k, value: bakeValue(k.value, scope) as Value })),
});

export { bakeAnimation };
