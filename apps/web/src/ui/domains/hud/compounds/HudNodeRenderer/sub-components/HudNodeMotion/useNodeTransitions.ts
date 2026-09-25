/* @layer renderer-hud @kind hook */
/**
 * Per-node CSS `transition` strings for `HudTransition` (`resolve-node-
 * transition.ts` does the actual mapping) - the one piece of state this
 * needs is "what was this node's own reading a render ago", so `when`'s
 * `delta` (the plan's own "only ease increases" example) has something to
 * read. Everything else about a value transition is the browser's own CSS
 * engine noticing a `left`/`opacity`/`transform` changed between renders -
 * nothing here samples a clock, because nothing needs to.
 */
import { useEffect, useRef } from 'react';
import { transitionCssValue } from './resolve-node-transition';
import type { PlacedNode } from '@shared/hud/engine';

type Scope = Readonly<Record<string, number>>;

interface NodeSnapshot { w: number; h: number; x: number; y: number; opacity: number }

const snapshotOf = (placed: PlacedNode): NodeSnapshot => ({
  w: placed.rect.w, h: placed.rect.h, x: placed.rect.x, y: placed.rect.y, opacity: placed.opacity,
});

/** The signed change in whichever ONE reading is first in the transition's
 *  own `properties` list that this snapshot can answer - `size` reads width,
 *  `position` reads x, `opacity` reads opacity. A transition naming only
 *  `tint`/`scale`/`color` has no numeric reading here to diff and always
 *  gates on `delta === 0`, which is why `resolve-node-transition.ts` treats
 *  an absent `when` as the common case. */
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

/** One CSS `transition` string per node that carries one - `undefined` for
 *  everything else, so the caller only ever spreads a key that means
 *  something. */
const useNodeTransitionCss = (nodes: readonly PlacedNode[], dataScope: Scope): ReadonlyMap<string, string> => {
  const prevRef = useRef<ReadonlyMap<string, NodeSnapshot>>(new Map());
  const css = new Map<string, string>();

  nodes.forEach((placed) => {
    if (placed.node.kind !== 'element' || !placed.node.transition) return;
    const cur = snapshotOf(placed);
    const delta = primaryDelta(placed.node.transition.properties, prevRef.current.get(placed.id), cur);
    const value = transitionCssValue(placed.node.transition, dataScope, delta);
    if (value) css.set(placed.id, value);
  });

  // Committed AFTER paint - this render's own `delta` reads what was on
  // screen a moment ago, not what it is about to become.
  useEffect(() => {
    const next = new Map<string, NodeSnapshot>();
    nodes.forEach((placed) => next.set(placed.id, snapshotOf(placed)));
    prevRef.current = next;
  });

  return css;
};

export { useNodeTransitionCss };
