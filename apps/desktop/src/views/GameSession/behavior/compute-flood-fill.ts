/* @layer renderer-appshell @kind logic */
import type { FloodFillDump, FloodFillDumpInput } from './dump-nav.type';
import { toGrid } from './to-grid';
import { encodeReachableRows } from './encode-reachable-rows';
import { encodeAttrRows } from './encode-attr-rows';

const computeFloodFill = (input: FloodFillDumpInput): FloodFillDump | null => {
  const { run, attrGrid, dualLayerGrids, roomLayout } = input;
  if (!attrGrid || !run) return null;

  const grid = toGrid(attrGrid);
  const { result, connections } = run;

  const shape = roomLayout?.shape ?? '1x1';
  const qfx = roomLayout?.quadrantFullsizeX ?? 0;
  const qfy = roomLayout?.quadrantFullsizeY ?? 0;
  const hasHorizontalBoundary = (shape === '2x2' || shape === '1x2') && qfy === 0;
  const hasVerticalBoundary = (shape === '2x2' || shape === '2x1') && qfx === 0;

  const crossingTiles: { axis: string; pos: number }[] = [];
  if (hasHorizontalBoundary) {
    for (let col = 0; col < 64; col++) {
      if (result.reachable[31]?.[col] && result.reachable[32]?.[col]) {
        crossingTiles.push({ axis: 'horizontal', pos: col });
      }
    }
  }
  if (hasVerticalBoundary) {
    for (let row = 0; row < 64; row++) {
      if (result.reachable[row]?.[31] && result.reachable[row]?.[32]) {
        crossingTiles.push({ axis: 'vertical', pos: row });
      }
    }
  }

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
    connections: connections.map(c => ({
      edge: c.edge,
      targetScreen: c.targetScreen,
      targetScreenHex: `0x${c.targetScreen.toString(16).padStart(4, '0')}`,
      isIntraRoom: c.isIntraRoom ?? false,
      layerToggle: c.layerToggle ?? false,
      freeTileCount: c.freeTileCount,
      itemTileCount: c.itemTileCount,
      positions: c.positions,
    })),
    scrollBoundary: {
      shape,
      quadrantFullsizeX: qfx,
      quadrantFullsizeY: qfy,
      hasHorizontalBoundary,
      hasVerticalBoundary,
      crossingTiles,
    },
  };
};

export { computeFloodFill };
