/* @layer renderer-hud @kind logic */
import { resolveValue, gateTruthy } from '@rotp/hud';
import type { HudTransition } from '@rotp/hud';
import { CSS_PROPERTIES } from './HudNodeMotion.constants';
import type { MotionScope } from './HudNodeMotion.type';

const transitionCssValue = (transition: HudTransition | undefined, scope: MotionScope, delta: number): string | undefined => {
  if (!transition || transition.properties.length === 0) return undefined;
  const gateScope = { ...scope, delta };
  if (transition.when !== undefined && !gateTruthy(transition.when, gateScope)) return undefined;

  const cssProps = new Set<string>();
  transition.properties.forEach((p) => CSS_PROPERTIES[p].forEach((cssProp) => cssProps.add(cssProp)));
  const duration = resolveValue(transition.duration, scope);
  const easing = transition.easing ?? 'ease-out';
  return [...cssProps].map((cssProp) => `${cssProp} ${duration}ms ${easing}`).join(', ');
};

export { transitionCssValue };
