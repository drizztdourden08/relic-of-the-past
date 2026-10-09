/* @layer bridge-wasm @kind logic */
import { usableEntranceTransition } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { screenDiagnostics } from './screen-diagnostics';
import type { ScreenFlood, ScreenFloodRun } from './flood-screen.type';

const summarizeRun = (run: ScreenFloodRun, items: TileReq[], screenIndex?: number): ScreenFlood => {
  const { result, connections } = run;
  const entranceCount = result.entrances.filter((e) =>
    result.transitions.some((t) => t.entranceIdx === e.id && usableEntranceTransition(result, t, items)),
  ).length;
  const intraCount = connections.filter((c) => c.isIntraRoom).length;
  return {
    reachableCount: result.reachableCount,
    totalTiles: result.totalTiles,
    ledgeCount: result.ledges.length,
    entranceCount,
    edgeCount: connections.length - intraCount,
    intraCount,
    connections,
    ...screenDiagnostics(result, screenIndex),
  };
};

export { summarizeRun };
