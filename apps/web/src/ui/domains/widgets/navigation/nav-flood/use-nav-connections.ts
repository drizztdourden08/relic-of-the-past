/* @layer renderer-widgets @kind hook */
/** Classify connections as internal (within bundle / intra-room) vs external, with dedup. */
import { useMemo, useCallback } from 'react';
import type { ConnectionInfo, ScreenBundle } from '@shared/game/navigation';

const useNavConnections = (connections: ConnectionInfo[], screenBundle: ScreenBundle | null, isIndoors: boolean) => {
  // For indoor rooms, use `isIntraRoom` flag (set by getConnections for quadrant boundaries).
  // For overworld, use bundle membership (adjacent screens in a 2×2 big-screen group).
  const bundleScreenSet = useMemo(() => new Set(screenBundle?.screens ?? []), [screenBundle]);
  const sortConn = (a: ConnectionInfo, b: ConnectionInfo) => {
    const edgeOrder = { north: 0, south: 1, west: 2, east: 3 };
    const d = (edgeOrder[a.edge] ?? 0) - (edgeOrder[b.edge] ?? 0);
    if (d !== 0) return d;
    const sa = a.sourceScreen ?? 0, sb = b.sourceScreen ?? 0;
    if (sa !== sb) return sa - sb;
    return a.targetScreen - b.targetScreen;
  };
  const isInternalConn = useCallback((c: ConnectionInfo) => {
    if (isIndoors) return !!c.isIntraRoom;
    return bundleScreenSet.has(c.targetScreen);
  }, [isIndoors, bundleScreenSet]);
  const externalConnections = useMemo(() => connections.filter(c => !isInternalConn(c)).sort(sortConn), [connections, isInternalConn]);
  const internalConnections = useMemo(() => {
    // Deduplicate: A→east→B and B→west→A are the same border. Keep the spatially-correct one.
    // For intra-room edges, keep all of them (south+north are two sides of the same boundary).
    const internal = connections.filter(c => isInternalConn(c)).sort(sortConn);
    const intraRoom = internal.filter(c => c.isIntraRoom);
    const interScreen = internal.filter(c => !c.isIntraRoom);
    const bestByPair = new Map<string, ConnectionInfo>();
    for (const c of interScreen) {
      const pair = [c.sourceScreen ?? 0, c.targetScreen].sort((a, b) => a - b);
      const key = `${pair[0]}-${pair[1]}`;
      const existing = bestByPair.get(key);
      // Prefer east (left→right) and south (top→bottom) for spatial correctness
      if (!existing || c.edge === 'east' || c.edge === 'south') {
        bestByPair.set(key, c);
      }
    }
    return [...intraRoom, ...bestByPair.values()];
  }, [connections, isInternalConn]);

  return { externalConnections, internalConnections };
};

export { useNavConnections };
