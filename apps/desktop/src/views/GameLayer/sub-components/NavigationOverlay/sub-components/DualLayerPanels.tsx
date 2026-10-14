/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { DualLayerPanelsProps } from '@app/navigation-overlay/tooltip/tooltip.type';
import { LayerBlock } from './LayerBlock';
import { ABOVE_HEADING, GROUND_HEADING } from '@app/navigation-overlay/layer-display/layer-display.constants';

const DualLayerPanels = ({ ground, above }: DualLayerPanelsProps) => (
  <Box className="nav-tip__dual">
    <Box className="nav-tip__dual-left">
      <LayerBlock name={GROUND_HEADING} nameTone="ground" data={ground} />
    </Box>
    <Box className="nav-tip__dual-right">
      <LayerBlock name={ABOVE_HEADING} nameTone="above" data={above} />
    </Box>
  </Box>
);

export { DualLayerPanels };
