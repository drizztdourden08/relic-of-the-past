/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import type { DualLayerPanelsProps } from './tooltip.type';
import { S } from './styles';
import { LayerBlock } from './layer-panels';
import { ABOVE_HEADING, GROUND_HEADING } from './layer-display/layer-display.constants';

const DualLayerPanels = ({ ground, above }: DualLayerPanelsProps) => (
  <Box style={S.dualRow}>
    <Box style={S.dualColLeft}>
      <LayerBlock name={GROUND_HEADING} nameColor="var(--c-info)" data={ground} />
    </Box>
    <Box style={S.dualColRight}>
      <LayerBlock name={ABOVE_HEADING} nameColor="var(--c-gold)" data={above} />
    </Box>
  </Box>
);

export { DualLayerPanels };
