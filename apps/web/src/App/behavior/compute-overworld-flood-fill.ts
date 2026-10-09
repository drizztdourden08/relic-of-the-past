/* @layer renderer-appshell @kind logic */
import type { FloodFillDump, FloodRun } from './dump-nav.type';
import { toGrid } from './to-grid';
import { encodeReachableRows } from './encode-reachable-rows';
import { encodeAttrRows } from './encode-attr-rows';

const computeOverworldFloodFill = (
  run: FloodRun | null,
  attrGrid: Uint8Array | null,
): FloodFillDump | null => {
  if (!attrGrid || !run) return null;
  const { result, connections } = run;

  return {
    reachableCount: result.reachableCount,
    totalTiles: result.totalTiles,
    reachableRows: encodeReachableRows(result.reachable),
    ledges: result.ledges.map(({ startRow, startCol, endRow, endCol }) => ({ startRow, startCol, endRow, endCol })),
    attrRows: { layer0: encodeAttrRows(toGrid(attrGrid)), layer1: null },
    connections: connections.map(c => ({
      edge: c.edge,
      targetScreen: c.targetScreen,
      targetScreenHex: `0x${c.targetScreen.toString(16).padStart(4, '0')}`,
      freeTileCount: c.freeTileCount,
      itemTileCount: c.itemTileCount,
      positions: c.positions,
    })),
    scrollBoundary: null,
  };
};

export { computeOverworldFloodFill };
