/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { TooltipData } from './types';
import { S } from './styles';

interface ExtraRowsProps {
  tooltip: TooltipData;
}

const isAnyLayerReachable = (tooltip: TooltipData): boolean => {
  const { layers } = tooltip;
  return layers.mode === 'dual'
    ? layers.ground.reach !== 0 || layers.above.reach !== 0
    : layers.primary.reach !== 0;
};

// Path requirements show only once a layer is reached.
const TooltipExtraRows = ({ tooltip }: ExtraRowsProps) => (
  <>
    {isAnyLayerReachable(tooltip) && (
      <Box style={S.row}>
        <Text style={S.dim}>path reqs:</Text>
        <Text style={{ color: tooltip.pathReqs ? 'var(--c-gold)' : 'var(--c-text-muted)' }}>
          {tooltip.pathReqs || 'none'}
        </Text>
      </Box>
    )}
    <Box style={S.row}>
      <Text style={S.dim}>live sprites:</Text>
      <Text style={S.muted}>{tooltip.spriteInfo.length}</Text>
    </Box>
    <Box style={S.row}>
      <Text style={S.dim}>Blocked In Last Flood Fill:</Text>
      <Text style={{ color: tooltip.bfsBlocked ? 'var(--c-danger)' : 'var(--c-text-muted)' }}>
        {tooltip.bfsBlocked ? 'yes' : 'no'}
      </Text>
    </Box>
    {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
      <Box key={i} style={S.warning}>{line}</Box>
    ))}
  </>
);

export { TooltipExtraRows };
