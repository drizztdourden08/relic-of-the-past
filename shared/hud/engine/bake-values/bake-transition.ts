/* @layer shared-hud @kind logic */
import { bakeGate } from './bake-gate';
import { bakeValue } from './bake-value';
import type { HudTransition } from '../../../types/hud/hud-motion';
import type { Value } from '../../../types/hud/hud-value';
import type { Scope } from '../engine.type';

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

export { bakeTransition };
