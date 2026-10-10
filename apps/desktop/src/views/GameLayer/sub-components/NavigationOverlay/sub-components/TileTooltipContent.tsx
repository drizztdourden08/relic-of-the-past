/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { TileTooltipContentProps } from '@app/navigation-overlay/tooltip/tooltip.type';
import { S } from '@app/navigation-overlay/tooltip/styles';
import { LayerBlock } from './LayerBlock';
import { DualLayerPanels } from './DualLayerPanels';
import { TooltipExtraRows } from './TooltipExtraRows';
import { ABOVE_HEADING, GROUND_HEADING } from '@app/navigation-overlay/layer-display/layer-display.constants';

const TileTooltipContent = ({ tooltip }: TileTooltipContentProps) => {
  const { layers, x, y } = tooltip;
  const containerStyle = useMemo(() => ({ ...S.container, left: x, top: y }), [x, y]);

  return (
    <Box style={containerStyle}>
      <Box style={S.headerRow}>
        <Text style={S.muted}>[{tooltip.row},{tooltip.col}]</Text>
        <Text style={S.dim}>{tooltip.roomTypeLabel}</Text>
      </Box>

      {layers.mode === 'dual' && <DualLayerPanels ground={layers.ground} above={layers.above} />}

      {layers.mode === 'locked' && (
        <LayerBlock
          name={layers.lockedLayer === 0 ? ABOVE_HEADING : GROUND_HEADING}
          nameColor={layers.lockedLayer === 0 ? 'var(--c-primary)' : 'var(--c-info)'}
          data={layers.primary}
          locked
        />
      )}

      {layers.mode === 'single' && (
        <LayerBlock name={GROUND_HEADING} nameColor="var(--c-info)" data={layers.primary} />
      )}

      <TooltipExtraRows tooltip={tooltip} />
    </Box>
  );
};

export { TileTooltipContent };
