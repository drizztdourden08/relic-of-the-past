/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { TileTooltipContentProps } from '@app/navigation-overlay/tooltip/tooltip.type';
import { LayerBlock } from './LayerBlock';
import { DualLayerPanels } from './DualLayerPanels';
import { TooltipExtraRows } from './TooltipExtraRows';
import { ABOVE_HEADING, GROUND_HEADING } from '@app/navigation-overlay/layer-display/layer-display.constants';
import './TileTooltipContent.css';

const TileTooltipContent = ({ tooltip }: TileTooltipContentProps) => {
  const { layers, x, y } = tooltip;
  const positionStyle = useMemo(() => ({ left: x, top: y }), [x, y]);

  return (
    <Box className="nav-tip" style={positionStyle}>
      <Box className="nav-tip__header">
        <Text className="nav-tip__muted">[{tooltip.row},{tooltip.col}]</Text>
        <Text className="nav-tip__dim">{tooltip.roomTypeLabel}</Text>
      </Box>

      {layers.mode === 'dual' && <DualLayerPanels ground={layers.ground} above={layers.above} />}

      {layers.mode === 'locked' && (
        <LayerBlock
          name={layers.lockedLayer === 0 ? ABOVE_HEADING : GROUND_HEADING}
          nameTone={layers.lockedLayer === 0 ? 'above' : 'ground'}
          data={layers.primary}
          locked
        />
      )}

      {layers.mode === 'single' && (
        <LayerBlock name={GROUND_HEADING} nameTone="ground" data={layers.primary} />
      )}

      <TooltipExtraRows tooltip={tooltip} />
    </Box>
  );
};

export { TileTooltipContent };
