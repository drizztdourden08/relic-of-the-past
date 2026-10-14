/* @layer renderer-appshell @kind logic */
import type { FloodFillDump, FloodFillDumpInput } from './dump-nav.type';
import { toGrid } from './to-grid';
import { encodeReachableRows } from './encode-reachable-rows';
import { encodeAttrRows } from './encode-attr-rows';
import { dumpFloodConnection } from './dump-flood-connection';
import { scrollBoundary } from './scroll-boundary';

const computeFloodFill = (input: FloodFillDumpInput): FloodFillDump | null => {
  const { run, attrGrid, dualLayerGrids, roomLayout } = input;
  if (!attrGrid || !run) return null;

  const grid = toGrid(attrGrid);
  const { result, connections } = run;

  return {
    reachableCount: result.reachableCount,
    totalTiles: result.totalTiles,
    reachableRows: encodeReachableRows(result.reachable),
    reachableByLayer: result.reachableByLayer
      ? { layer0: encodeReachableRows(result.reachableByLayer[0]), layer1: encodeReachableRows(result.reachableByLayer[1]) }
      : undefined,
    ledges: result.ledges.map(({ startRow, startCol, endRow, endCol }) => ({ startRow, startCol, endRow, endCol })),
    attrRows: {
      layer0: encodeAttrRows(dualLayerGrids?.layer0 ?? grid),
      layer1: dualLayerGrids ? encodeAttrRows(dualLayerGrids.layer1) : null,
    },
    connections: connections.map(dumpFloodConnection),
    scrollBoundary: scrollBoundary(roomLayout, result.reachable),
  };
};

export { computeFloodFill };
