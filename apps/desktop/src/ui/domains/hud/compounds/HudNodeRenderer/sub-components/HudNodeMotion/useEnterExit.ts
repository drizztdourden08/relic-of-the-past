/* @layer renderer-hud @kind hook */
import { useEffect, useRef, useState } from 'react';
import type { PlacedNode } from '@shared/hud/engine';
import { POST_EXIT, PRE_ENTER } from './HudNodeMotion.constants';
import type { EnterExitResult, Ghost } from './HudNodeMotion.type';

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
