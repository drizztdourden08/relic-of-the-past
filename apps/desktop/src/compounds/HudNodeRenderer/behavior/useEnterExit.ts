/* @layer renderer-hud @kind hook */
import { useEffect, useRef, useState } from 'react';
import type { PlacedNode } from '@rotp/hud';
import { addGhosts } from './add-ghosts';
import { enterExitCss } from './enter-exit-css';
import { hasTransition } from './has-transition';
import { POST_EXIT, PRE_ENTER } from './hud-node-motion.constants';
import type { EnterExitResult, Ghost } from './hud-node-motion.type';
import { scheduleGhostRemoval } from './schedule-ghost-removal';
import { withoutIds } from './without-ids';

const useEnterExit = (nodes: readonly PlacedNode[]): EnterExitResult => {
  const seenRef = useRef<Set<string>>(new Set());
  const [enteringIds, setEnteringIds] = useState<ReadonlySet<string>>(new Set());
  const [ghosts, setGhosts] = useState<readonly Ghost[]>([]);
  const prevByIdRef = useRef<ReadonlyMap<string, PlacedNode>>(new Map());

  const currentIds = new Set(nodes.map((p) => p.id));
  const arrivals = nodes.filter((p) => !seenRef.current.has(p.id) && hasTransition(p, 'enter'));
  const departures = [...prevByIdRef.current.values()].filter((p) => !currentIds.has(p.id) && hasTransition(p, 'exit'));

  useEffect(() => {
    nodes.forEach((p) => seenRef.current.add(p.id));
    prevByIdRef.current = new Map(nodes.map((p) => [p.id, p] as const));

    if (arrivals.length) {
      const arrivalIds = arrivals.map((p) => p.id);
      setEnteringIds((prev) => new Set([...prev, ...arrivalIds]));
      const raf = requestAnimationFrame(() => setEnteringIds((prev) => withoutIds(prev, arrivalIds)));
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [nodes]);

  useEffect(() => {
    if (!departures.length) return undefined;
    setGhosts((prev) => addGhosts(prev, departures, performance.now()));
    const timers = departures.map((placed) => scheduleGhostRemoval(placed, setGhosts));
    return () => timers.forEach(clearTimeout);
  }, [nodes]);

  const ghostNodes = ghosts.map((g) => g.placed);
  const exitingIds = new Set(ghosts.map((g) => g.placed.id));

  return {
    renderNodes: [...nodes, ...ghostNodes.filter((g) => !currentIds.has(g.id))],
    enterStyle: (id) => (enteringIds.has(id) ? PRE_ENTER : {}),
    exitStyle: (id) => (exitingIds.has(id) ? POST_EXIT : {}),
    transitionCss: (id) => enterExitCss({ id, nodes, ghosts, enteringIds, exitingIds }),
  };
};

export { useEnterExit };
