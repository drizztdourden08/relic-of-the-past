/* @layer renderer-widgets @kind hook */
/** Classify connections as internal (within bundle / intra-room) vs external, with dedup. */
import { useMemo, useCallback } from 'react';
import type { ConnectionInfo, ScreenBundle, ScreenCrossing, ScreenCrossings } from '@shared/game/navigation';

/** One boundary scroll off the flooded area. */
interface EdgeRow {
  crossing: ScreenCrossing;
  /** The screen the scroll leaves, so a multi-screen area can name its side. */
  sourceScreen: number;
}

const EDGE_ORDER: Record<string, number> = { north: 0, south: 1, west: 2, east: 3 };

/** The raw index a crossing targets: an overworld screen, or a room. */
const nativeIndex = (crossing: ScreenCrossing): number => {
  const native = crossing.target.native;
  if (!native) return -1;
  return native.kind === 'overworld' ? native.screen : native.room;
};

const useNavConnections = (
  connections: ConnectionInfo[],
  screenBundle: ScreenBundle | null,
  isIndoors: boolean,
  crossings: readonly ScreenCrossings[],
) => {
  // For indoor rooms, use `isIntraRoom` flag (set by getConnections for quadrant boundaries).
  // For overworld, use bundle membership (adjacent screens in a 2×2 big-screen group).
  const bundleScreenSet = useMemo(() => new Set(screenBundle?.screens ?? []), [screenBundle]);
  const sortConn = (a: ConnectionInfo, b: ConnectionInfo) => {
    const d = (EDGE_ORDER[a.edge] ?? 0) - (EDGE_ORDER[b.edge] ?? 0);
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
      // Prefer east (left→right) and south (top→bottom) for spatial correctness
      if (!bestByPair.has(key) || c.edge === 'east' || c.edge === 'south') {
        bestByPair.set(key, c);
      }
    }
    return [...intraRoom, ...bestByPair.values()];
  }, [connections, isInternalConn]);

  // The same internal/external split over the crossings, so the panel lists the
  // borders the minimap draws arrows for.
  const externalEdges = useMemo(() => {
    const rows: EdgeRow[] = [];
    for (const screen of crossings) {
      for (const crossing of screen.edges) {
        const internal = isIndoors ? !!crossing.isIntraRoom : bundleScreenSet.has(nativeIndex(crossing));
        if (internal) continue;
        rows.push({ crossing, sourceScreen: screen.screenIndex });
      }
    }
    return rows.sort((a, b) => {
      const d = (EDGE_ORDER[a.crossing.side ?? ''] ?? 0) - (EDGE_ORDER[b.crossing.side ?? ''] ?? 0);
      if (d !== 0) return d;
      if (a.sourceScreen !== b.sourceScreen) return a.sourceScreen - b.sourceScreen;
      return nativeIndex(a.crossing) - nativeIndex(b.crossing);
    });
  }, [crossings, isIndoors, bundleScreenSet]);

  return { externalConnections, internalConnections, externalEdges };
};

export { useNavConnections };
export type { EdgeRow };
