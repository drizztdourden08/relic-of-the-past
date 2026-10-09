/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { TileTooltipContentProps } from './tooltip.type';
import { S } from './styles';
import { LayerBlock } from './layer-panels';
import { DualLayerPanels } from './dual-layer-panels';
import { TooltipExtraRows } from './extra-rows';
import { ABOVE_HEADING, GROUND_HEADING } from './layer-display/layer-display.constants';

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
          nameColor={layers.lockedLayer === 0 ? 'var(--c-gold)' : 'var(--c-info)'}
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
