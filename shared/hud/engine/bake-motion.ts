/* @layer shared-hud @kind logic */
/**
 * `animation`/`transition` fields, baked - split out of `bake-values.ts`
 * purely to keep it under this repo's line cap (the same reason
 * `validate-container.ts` split out of `validate-node.ts`).
 *
 * A bare gate expression (`animation[].when`, `transition.when`) is baked the
 * same way a `switch` case's `when` would be if IT needed baking: evaluated
 * NOW, against this repeat instance's own `index`/`count`/`item`, and
 * replaced with the literal string `"1"`/`"0"` - so the SAME string, read
 * later against the document's global scope (which has never heard of those
 * three names), still means exactly what it meant here. Every other field is
 * a `Value` and bakes the ordinary way (`bakeValue`).
 */

import { resolveValue } from '../data/resolve-value';
import type { HudAnimation, HudTransition } from '../../types/hud/hud-motion';
import type { Value } from '../../types/hud/hud-value';

type Scope = Readonly<Record<string, number>>;

const bakeValue = (value: Value | undefined, scope: Scope): Value | undefined => (
  value === undefined ? undefined : resolveValue(value, scope)
);

const bakeGate = (expr: string | undefined, scope: Scope): string | undefined => (
  expr === undefined ? undefined : (resolveValue({ from: 'data', expr }, scope) !== 0 ? '1' : '0')
);

const bakeAnimation = (animation: HudAnimation, scope: Scope): HudAnimation => ({
  ...animation,
  ...(animation.when !== undefined ? { when: bakeGate(animation.when, scope) } : {}),
  duration: bakeValue(animation.duration, scope) as Value,
  ...(animation.delay !== undefined ? { delay: bakeValue(animation.delay, scope) } : {}),
  keyframes: animation.keyframes.map((k) => ({ ...k, value: bakeValue(k.value, scope) as Value })),
});

const bakeTransition = (transition: HudTransition | undefined, scope: Scope): HudTransition | undefined => {
  if (transition === undefined) return undefined;
  return {
    ...transition,
    duration: bakeValue(transition.duration, scope) as Value,
    ...(transition.when !== undefined ? { when: bakeGate(transition.when, scope) } : {}),
    ...(transition.enter
      ? { enter: { ...transition.enter, duration: bakeValue(transition.enter.duration, scope) as Value } } : {}),
    ...(transition.exit
      ? { exit: { ...transition.exit, duration: bakeValue(transition.exit.duration, scope) as Value } } : {}),
  };
};

export { bakeAnimation, bakeTransition };
