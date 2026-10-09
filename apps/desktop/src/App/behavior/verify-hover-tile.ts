/* @layer renderer-appshell @kind logic */
import type { DualLayerGrids, HoverTile, HoverVerification } from './dump-layers.type';
import { isLayer1Reachable } from './is-layer1-reachable';

const verifyHoverTile = (dualLayerGrids: DualLayerGrids | null, hoverTile: HoverTile): HoverVerification | null => {
  if (!dualLayerGrids) {
    console.log(`[DumpLayers] No dual-layer grids (single-layer room), so the tooltip would NOT show split`);
    return null;
  }
  const l0 = dualLayerGrids.layer0[hoverTile.row]?.[hoverTile.col] ?? -1;
  const l1 = dualLayerGrids.layer1[hoverTile.row]?.[hoverTile.col] ?? -1;
  const wouldSplit = l0 !== l1;

  const layer1Reachable = l1 === 0x00 && wouldSplit
    ? isLayer1Reachable(dualLayerGrids, hoverTile.row, hoverTile.col)
    : false;

  const tooltipWouldShow = wouldSplit && (layer1Reachable || l1 !== 0x00);
  console.log(`[DumpLayers] Data at [${hoverTile.col},${hoverTile.row}]: layer0=0x${l0.toString(16)}, layer1=0x${l1.toString(16)}, wouldSplit=${wouldSplit}`);
  console.log(`[DumpLayers] layer1Reachable=${layer1Reachable}, tooltipWouldShow=${tooltipWouldShow}`);
  return { layer0: l0, layer1: l1, wouldSplit };
};

export { verifyHoverTile };
