/* @layer renderer-hud @kind hook */
/**
 * The one hook `HudNodeRenderer.tsx` calls: animation (its own clock),
 * transition (the browser's clock, primed by a CSS string) and enter/exit
 * (a node arriving or leaving), combined per node. Costs nothing beyond one
 * boolean check when a document carries none of the three - every shipped
 * built-in, today - because `useMotionClock`'s own `requestAnimationFrame`
 * loop never starts unless `hasAnimation` is true.
 */
import { resolveNodeAnimationStyle } from './resolve-node-animation';
import { useEnterExit } from './useEnterExit';
import { useMotionClock } from './useMotionClock';
import { useNodeTransitionCss } from './useNodeTransitions';
import { useReducedMotion } from './useReducedMotion';
import type { CSSProperties } from 'react';
import type { PlacedNode } from '@shared/hud/engine';

type Scope = Readonly<Record<string, number>>;

interface HudNodeMotionResult {
  /** `nodes` plus any still-fading exit ghost - render THIS list, not `nodes`. */
  renderNodes: readonly PlacedNode[];
  /** transform/filter/width/height/transition, ready to spread into the
   *  wrapper's `style` - everything except opacity, which multiplies rather
   *  than replaces (see `opacityFor`). */
  styleFor: (placed: PlacedNode) => CSSProperties;
  /** `placed.opacity`, multiplied by whatever an active `opacity` animation
   *  or enter/exit fade contributes. Always call this instead of reading
   *  `placed.opacity` directly once motion is wired in. */
  opacityFor: (placed: PlacedNode) => number;
}

const useHudNodeMotion = (
  nodes: readonly PlacedNode[], dataScope: Scope, displayScale: number, clockOverrideMs?: number | null,
): HudNodeMotionResult => {
  const reducedMotion = useReducedMotion();
  const hasAnimation = nodes.some((p) => (p.node.animation?.length ?? 0) > 0);
  // A number parks the clock at that instant instead of running it - the HUD
  // editor's scrub, and nothing in the shipped app (see `useMotionClock`).
  const nowMs = useMotionClock(hasAnimation && !reducedMotion, clockOverrideMs);
  const transitionCss = useNodeTransitionCss(nodes, dataScope);
  const { renderNodes, enterStyle, exitStyle, transitionCss: enterExitTransitionCss } = useEnterExit(nodes);

  const styleFor = (placed: PlacedNode): CSSProperties => {
    const { css } = resolveNodeAnimationStyle(placed.node.animation, nowMs, dataScope, reducedMotion, placed.node.style, displayScale);
    // `opacity` is handled exclusively by `opacityFor` (it MULTIPLIES rather
    // than replaces) - only the transform half of an enter/exit override
    // belongs here.
    const { transform } = { ...enterStyle(placed.id), ...exitStyle(placed.id) };
    const transition = enterExitTransitionCss(placed.id) ?? transitionCss.get(placed.id);
    return { ...css, ...(transform ? { transform } : {}), ...(transition ? { transition } : {}) };
  };

  const opacityFor = (placed: PlacedNode): number => {
    const { opacityMultiplier } = resolveNodeAnimationStyle(
      placed.node.animation, nowMs, dataScope, reducedMotion, placed.node.style, displayScale,
    );
    const enterExitOpacity = (enterStyle(placed.id).opacity as number | undefined)
      ?? (exitStyle(placed.id).opacity as number | undefined);
    return placed.opacity * opacityMultiplier * (enterExitOpacity ?? 1);
  };

  return { renderNodes, styleFor, opacityFor };
};

export { useHudNodeMotion };
