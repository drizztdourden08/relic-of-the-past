/* @layer renderer-hud @kind hook */
import { resolveNodeAnimationStyle } from './resolve-node-animation';
import { useEnterExit } from './useEnterExit';
import { useMotionClock } from './useMotionClock';
import { useNodeTransitionCss } from './useNodeTransitionCss';
import { useReducedMotion } from './useReducedMotion';
import type { CSSProperties } from 'react';
import type { PlacedNode } from '@shared/hud/engine';
import type { HudNodeMotionResult, MotionScope } from './HudNodeMotion.type';

const useHudNodeMotion = (
  nodes: readonly PlacedNode[], dataScope: MotionScope, displayScale: number, clockOverrideMs?: number | null,
): HudNodeMotionResult => {
  const reducedMotion = useReducedMotion();
  const hasAnimation = nodes.some((p) => (p.node.animation?.length ?? 0) > 0);
  const nowMs = useMotionClock(hasAnimation && !reducedMotion, clockOverrideMs);
  const transitionCss = useNodeTransitionCss(nodes, dataScope);
  const { renderNodes, enterStyle, exitStyle, transitionCss: enterExitTransitionCss } = useEnterExit(nodes);

  const styleFor = (placed: PlacedNode): CSSProperties => {
    const { css } = resolveNodeAnimationStyle(placed.node.animation, nowMs, dataScope, reducedMotion, placed.node.style, displayScale);
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
