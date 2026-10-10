/* @layer renderer-hud @kind hook */
import { useEffect, useRef } from 'react';
import { transitionCssValue } from './resolve-node-transition';
import type { PlacedNode } from '@rotp/hud';
import type { MotionScope, NodeSnapshot } from './hud-node-motion.type';

const snapshotOf = (placed: PlacedNode): NodeSnapshot => ({
  w: placed.rect.w, h: placed.rect.h, x: placed.rect.x, y: placed.rect.y, opacity: placed.opacity,
});

const primaryDelta = (
  properties: readonly string[], prev: NodeSnapshot | undefined, cur: NodeSnapshot,
): number => {
  if (!prev) return 0;
  const prop = properties.find((p) => p === 'size' || p === 'position' || p === 'opacity');
  if (prop === 'size') return cur.w - prev.w;
  if (prop === 'position') return cur.x - prev.x;
  if (prop === 'opacity') return cur.opacity - prev.opacity;
  return 0;
};

const useNodeTransitionCss = (nodes: readonly PlacedNode[], dataScope: MotionScope): ReadonlyMap<string, string> => {
  const prevRef = useRef<ReadonlyMap<string, NodeSnapshot>>(new Map());
  const css = new Map<string, string>();

  nodes.forEach((placed) => {
    if (placed.node.kind !== 'element' || !placed.node.transition) return;
    const cur = snapshotOf(placed);
    const delta = primaryDelta(placed.node.transition.properties, prevRef.current.get(placed.id), cur);
    const value = transitionCssValue(placed.node.transition, dataScope, delta);
    if (value) css.set(placed.id, value);
  });

  useEffect(() => {
    const next = new Map<string, NodeSnapshot>();
    nodes.forEach((placed) => next.set(placed.id, snapshotOf(placed)));
    prevRef.current = next;
  });

  return css;
};

export { useNodeTransitionCss };
