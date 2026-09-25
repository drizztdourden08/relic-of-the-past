/* @layer renderer-hud @kind hook */
/**
 * A node's own `transition.enter`/`exit` - "a `repeat`'s count changing is not
 * a value transition, it is a node appearing or disappearing" (the plan's own
 * words). Two mechanisms, because arriving and leaving are not symmetric in
 * React: an ARRIVING node is already in `nodes` and just needs one extra
 * render to flip from its pre-enter style to rest, under a `transition` CSS
 * string, which is the standard two-frame mount fade. A LEAVING node is
 * ALREADY GONE from `nodes` the instant its `repeat` stops producing it -
 * there is nothing left to ease unless this hook keeps drawing a GHOST of it,
 * at its last known rect, for exactly `exit.duration` ms.
 *
 * KNOWN, ACCEPTED LIMIT: a ghost is keyed by node id: a `repeat` instance that
 * exits and a DIFFERENT instance that enters with the SAME id within one
 * exit window are not expected here (`expand.ts`'s own `#index` suffixing
 * means this only bites an id an author reused by hand, not an ordinary
 * repeat resize).
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PlacedNode } from '@shared/hud/engine';

interface Ghost { placed: PlacedNode; removeAt: number }

interface EnterExitResult {
  /** The nodes to actually render this frame - `nodes` plus any still-fading
   *  ghost, in the order they should paint. */
  renderNodes: readonly PlacedNode[];
  /** The one-shot pre-enter override for a node that just arrived - opacity/
   *  scale/position pulled TOWARD rest, cleared on the render right after. */
  enterStyle: (id: string) => CSSProperties;
  /** A ghost's own exit override - opacity/scale/position pushed AWAY from
   *  rest, active for its whole `removeAt` window. */
  exitStyle: (id: string) => CSSProperties;
  transitionCss: (id: string) => string | undefined;
}

const PRE_ENTER: CSSProperties = { opacity: 0, transform: 'scale(0.85)' };
const POST_EXIT: CSSProperties = { opacity: 0, transform: 'scale(0.85)' };

const useEnterExit = (nodes: readonly PlacedNode[]): EnterExitResult => {
  const seenRef = useRef<Set<string>>(new Set());
  const [enteringIds, setEnteringIds] = useState<ReadonlySet<string>>(new Set());
  const [ghosts, setGhosts] = useState<readonly Ghost[]>([]);
  const prevByIdRef = useRef<ReadonlyMap<string, PlacedNode>>(new Map());

  const currentIds = new Set(nodes.map((p) => p.id));
  const arrivals = nodes.filter((p) => !seenRef.current.has(p.id) && p.node.kind === 'element' && p.node.transition?.enter);
  const departures = [...prevByIdRef.current.values()].filter(
    (p) => !currentIds.has(p.id) && p.node.kind === 'element' && p.node.transition?.exit,
  );

  useEffect(() => {
    nodes.forEach((p) => seenRef.current.add(p.id));
    const nextByid = new Map(nodes.map((p) => [p.id, p] as const));
    prevByIdRef.current = nextByid;

    if (arrivals.length) {
      setEnteringIds((prev) => new Set([...prev, ...arrivals.map((p) => p.id)]));
      // One frame later: drop the pre-enter override so the CSS transition
      // (already active, since `transitionCss` does not gate on this state)
      // eases from it to rest.
      const raf = requestAnimationFrame(() => {
        setEnteringIds((prev) => {
          const next = new Set(prev);
          arrivals.forEach((p) => next.delete(p.id));
          return next;
        });
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [nodes]);

  useEffect(() => {
    if (!departures.length) return undefined;
    const now = performance.now();
    setGhosts((prev) => [
      ...prev.filter((g) => !departures.some((d) => d.id === g.placed.id)),
      ...departures.map((placed) => ({
        placed,
        removeAt: now + (typeof placed.node.transition?.exit?.duration === 'number' ? placed.node.transition.exit.duration : 0),
      })),
    ]);
    const timers = departures.map((placed) => {
      const ms = typeof placed.node.transition?.exit?.duration === 'number' ? placed.node.transition.exit.duration : 0;
      return setTimeout(() => setGhosts((prev) => prev.filter((g) => g.placed.id !== placed.id)), ms);
    });
    return () => timers.forEach(clearTimeout);
  }, [nodes]);

  const ghostNodes = ghosts.map((g) => g.placed);
  const exitingIds = new Set(ghosts.map((g) => g.placed.id));

  return {
    renderNodes: [...nodes, ...ghostNodes.filter((g) => !currentIds.has(g.id))],
    enterStyle: (id) => (enteringIds.has(id) ? PRE_ENTER : {}),
    exitStyle: (id) => (exitingIds.has(id) ? POST_EXIT : {}),
    transitionCss: (id) => {
      const placed = nodes.find((p) => p.id === id) ?? ghosts.find((g) => g.placed.id === id)?.placed;
      const isEntering = enteringIds.has(id) || exitingIds.has(id);
      if (!isEntering || placed?.node.kind !== 'element') return undefined;
      const spec = enteringIds.has(id) ? placed.node.transition?.enter : placed.node.transition?.exit;
      if (!spec) return undefined;
      const duration = typeof spec.duration === 'number' ? spec.duration : 0;
      return `opacity ${duration}ms ${spec.easing ?? 'ease-out'}, transform ${duration}ms ${spec.easing ?? 'ease-out'}`;
    },
  };
};

export { useEnterExit };
