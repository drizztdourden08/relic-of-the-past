/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ExtraRowsProps, TooltipData } from '@app/navigation-overlay/tooltip/tooltip.type';
import { S } from '@app/navigation-overlay/tooltip/styles';

const isAnyLayerReachable = (tooltip: TooltipData): boolean => {
  const { layers } = tooltip;
  return layers.mode === 'dual'
    ? layers.ground.reach !== 0 || layers.above.reach !== 0
    : layers.primary.reach !== 0;
};

const TooltipExtraRows = ({ tooltip }: ExtraRowsProps) => (
  <>
    {isAnyLayerReachable(tooltip) && (
      <Box style={S.row}>
        <Text style={S.dim}>path reqs:</Text>
        <Text style={tooltip.pathReqs ? S.gold : S.muted}>
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
      <Text style={tooltip.bfsBlocked ? S.danger : S.muted}>
        {tooltip.bfsBlocked ? 'yes' : 'no'}
      </Text>
    </Box>
    {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
      <Box key={i} style={S.warning}>{line}</Box>
    ))}
  </>
);

export { TooltipExtraRows };
