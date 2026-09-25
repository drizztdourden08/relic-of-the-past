/* @layer renderer-hud @kind logic */
/**
 * `transition`, turned into the one CSS lever that already does exactly what
 * this document model asks for: the browser's own `transition` property. A
 * bound value that changes between renders is a plain CSS value change
 * (`left`, `opacity`, `transform` and so on) the instant it happens - handing the
 * browser a `transition: <props> <duration>ms <easing>` string beforehand is
 * ALL that is needed for that change to ease instead of snap, which is
 * exactly `HudLayoutView.tsx`'s own pre-existing `CLUSTER_FADE` technique,
 * generalised to an author-chosen property list per node instead of one
 * hardcoded constant.
 *
 * `delta` IS THE ONE THING CSS CANNOT ANSWER ON ITS OWN. "Only ease when the
 * value grew" needs to know the signed change, which this file computes from
 * the two placed reads the caller hands it (this render's and last render's)
 * and folds into the `when` gate's own scope under that name - the plan's
 * own example, `delta > 0`, reads it exactly like any other variable.
 */
import { resolveValue } from '@shared/hud/data';
import { gateTruthy } from '@shared/hud/engine';
import type { HudTransition, HudTransitionProperty } from '@shared/types/hud';

type Scope = Readonly<Record<string, number>>;

const CSS_PROPERTIES: Record<HudTransitionProperty, readonly string[]> = {
  size: ['width', 'height'],
  position: ['left', 'top'],
  opacity: ['opacity'],
  scale: ['transform'],
  tint: ['filter'],
  color: ['filter'],
};

/**
 * @param delta the signed change in whichever single reading the caller
 *              considers this node's own "primary" moving number (its own
 *              `useNodeTransitions.ts` picks it from `properties`, in order).
 */
const transitionCssValue = (transition: HudTransition | undefined, scope: Scope, delta: number): string | undefined => {
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
