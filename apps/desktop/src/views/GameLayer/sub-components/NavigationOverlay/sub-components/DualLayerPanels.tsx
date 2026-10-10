/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { DualLayerPanelsProps } from '@app/navigation-overlay/tooltip/tooltip.type';
import { S } from '@app/navigation-overlay/tooltip/styles';
import { LayerBlock } from './LayerBlock';
import { ABOVE_HEADING, GROUND_HEADING } from '@app/navigation-overlay/layer-display/layer-display.constants';

const DualLayerPanels = ({ ground, above }: DualLayerPanelsProps) => (
  <Box style={S.dualRow}>
    <Box style={S.dualColLeft}>
      <LayerBlock name={GROUND_HEADING} nameColor="var(--c-info)" data={ground} />
    </Box>
    <Box style={S.dualColRight}>
      <LayerBlock name={ABOVE_HEADING} nameColor="var(--c-primary)" data={above} />
    </Box>
  </Box>
);

export { DualLayerPanels };
