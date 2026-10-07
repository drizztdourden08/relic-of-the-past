/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { TooltipData } from './types';
import { S } from './styles';
import { LayerBlock, DualLayerPanels } from './layer-panels';
import { TooltipExtraRows } from './extra-rows';

interface TileTooltipContentProps {
  tooltip: TooltipData;
}

/**
 * ONE tooltip layout for single/dual/locked modes: header, one or two layer blocks, extra rows.
 * Modes differ only in how many `LayerBlock`s render; the row list lives in classification-rows.tsx.
 */
const TileTooltipContent = ({ tooltip }: TileTooltipContentProps) => {
  const { layers } = tooltip;

  return (
    <Box style={{ ...S.container, left: tooltip.x, top: tooltip.y }}>
      <Box style={S.headerRow}>
        <Text style={S.muted}>[{tooltip.row},{tooltip.col}]</Text>
        <Text style={S.dim}>{tooltip.roomTypeLabel}</Text>
      </Box>

      {layers.mode === 'dual' && <DualLayerPanels ground={layers.ground} above={layers.above} />}

      {layers.mode === 'locked' && (
        <LayerBlock
          name={layers.lockedLayer === 0 ? '▲ ABOVE' : '▼ GROUND'}
          nameColor={layers.lockedLayer === 0 ? 'var(--c-gold)' : 'var(--c-info)'}
          data={layers.primary}
          locked
        />
      )}

      {layers.mode === 'single' && (
        <LayerBlock name="▼ GROUND" nameColor="var(--c-info)" data={layers.primary} />
      )}

      <TooltipExtraRows tooltip={tooltip} />
    </Box>
  );
};

export { TileTooltipContent };
