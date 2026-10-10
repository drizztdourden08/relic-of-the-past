/* @layer renderer-widgets @kind hook */
import { useMemo, useCallback } from 'react';
import type { ConnectionInfo, ScreenCrossing, ScreenCrossings } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';
import { EDGE_ORDER } from './nav-flood.constants';
import type { EdgeRow } from './nav-flood.type';

const nativeIndex = (crossing: ScreenCrossing): number => {
  const native = crossing.target.native;
  if (!native) return -1;
  return native.kind === 'overworld' ? native.screen : native.room;
};

const useNavConnections = (
  connections: ConnectionInfo[],
  screenBundle: ScreenBundleGrid | null,
  isIndoors: boolean,
  crossings: readonly ScreenCrossings[],
) => {
  const bundleScreenSet = useMemo(() => new Set(screenBundle?.screens ?? []), [screenBundle]);
  const sortConn = (a: ConnectionInfo, b: ConnectionInfo) => {
    const d = (EDGE_ORDER[a.edge] ?? 0) - (EDGE_ORDER[b.edge] ?? 0);
    if (d !== 0) return d;
    const sa = a.sourceScreen ?? 0, sb = b.sourceScreen ?? 0;
    if (sa !== sb) return sa - sb;
    return a.targetScreen - b.targetScreen;
  };
  const isInternalConn = useCallback((c: ConnectionInfo) => {
    if (isIndoors) return Boolean(c.isIntraRoom);
    return bundleScreenSet.has(c.targetScreen);
  }, [isIndoors, bundleScreenSet]);
  const externalConnections = useMemo(() => connections.filter(c => !isInternalConn(c)).sort(sortConn), [connections, isInternalConn]);
  const internalConnections = useMemo(() => {
    const internal = connections.filter(c => isInternalConn(c)).sort(sortConn);
    const intraRoom = internal.filter(c => c.isIntraRoom);
    const interScreen = internal.filter(c => !c.isIntraRoom);
    const bestByPair = new Map<string, ConnectionInfo>();
    for (const c of interScreen) {
      const pair = [c.sourceScreen ?? 0, c.targetScreen].sort((a, b) => a - b);
      const key = `${pair[0]}-${pair[1]}`;
      if (!bestByPair.has(key) || c.edge === 'east' || c.edge === 'south') {
        bestByPair.set(key, c);
      }
    }
    return [...intraRoom, ...bestByPair.values()];
  }, [connections, isInternalConn]);

  const externalEdges = useMemo(() => {
    const rows: EdgeRow[] = [];
    for (const screen of crossings) {
      for (const crossing of screen.edges) {
        const internal = isIndoors ? Boolean(crossing.isIntraRoom) : bundleScreenSet.has(nativeIndex(crossing));
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
