/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { LayerTileData } from './types';
import { S } from './styles';
import { ClassificationRows } from './classification-rows';
import { reachStatusFor } from './reach-status';

interface LayerBlockProps {
  name: string;
  nameColor: string;
  data: LayerTileData;
  locked?: boolean;
}

/**
 * One canonical layer block: its own header — name left, ITS OWN reach status
 * pinned top-right — over the five shared classification rows. Single-layer
 * and locked-layer modes render exactly one of these; dual-layer mode (below)
 * renders two side by side. No mode gets its own row list or layout.
 */
const LayerBlock = ({ name, nameColor, data, locked }: LayerBlockProps) => {
  const status = reachStatusFor(data.reach, data.classification.collision, data.isAboveLayer);
  return (
    <Box style={S.col}>
      <Box style={S.layerHeadRow}>
        <Text style={{ color: nameColor }}>
          {name}
          {locked && <Text style={S.lockedTag}> LOCKED</Text>}
        </Text>
        <Text style={{ color: status.color }}>{status.label}</Text>
      </Box>
      <ClassificationRows attr={data.classification.attr} classification={data.classification} canPass={data.canPass} />
    </Box>
  );
};

interface DualLayerPanelsProps {
  ground: LayerTileData;
  above: LayerTileData;
}

/** Dual-layer mode: two LayerBlocks side by side — ground first, same body, same row order. */
const DualLayerPanels = ({ ground, above }: DualLayerPanelsProps) => (
  <Box style={S.dualRow}>
    <Box style={S.dualColLeft}>
      <LayerBlock name="▼ GROUND" nameColor="var(--c-info)" data={ground} />
    </Box>
    <Box style={S.dualColRight}>
      <LayerBlock name="▲ ABOVE" nameColor="var(--c-gold)" data={above} />
    </Box>
  </Box>
);

export { LayerBlock, DualLayerPanels };
