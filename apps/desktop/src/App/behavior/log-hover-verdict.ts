/* @layer renderer-appshell @kind logic */
import type { HoverTile, HoverVerification } from './dump-layers.type';
import { UNNORMALIZED_ATTR } from './dump-layers.constants';

const logHoverVerdict = (hoverTile: HoverTile, verification: HoverVerification): void => {
  const { layer0, layer1, wouldSplit } = verification;
  const at = `[${hoverTile.col},${hoverTile.row}]`;
  if (layer0 === UNNORMALIZED_ATTR || layer1 === UNNORMALIZED_ATTR) {
    console.log(`[DumpLayers] BUG: Tile ${at} has 0x1C (normalization failed!): layer0=0x${layer0.toString(16)}, layer1=0x${layer1.toString(16)}`);
  } else if (wouldSplit) {
    console.log(`[DumpLayers] NO 0x1C: Tile ${at} has legitimate split (layer0=0x${layer0.toString(16)}, layer1=0x${layer1.toString(16)})`);
  } else {
    console.log(`[DumpLayers] FIX VERIFIED: Tile ${at} layers match (both = 0x${layer0.toString(16)})`);
  }
};

export { logHoverVerdict };
