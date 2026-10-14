/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ExtraRowsProps, TooltipData } from '@app/navigation-overlay/tooltip/tooltip.type';

const isAnyLayerReachable = (tooltip: TooltipData): boolean => {
  const { layers } = tooltip;
  return layers.mode === 'dual'
    ? layers.ground.reach !== 0 || layers.above.reach !== 0
    : layers.primary.reach !== 0;
};

const TooltipExtraRows = ({ tooltip }: ExtraRowsProps) => (
  <>
    {isAnyLayerReachable(tooltip) && (
      <Box className="nav-tip__row">
        <Text className="nav-tip__dim">path reqs:</Text>
        <Text className={tooltip.pathReqs ? 'nav-tip__gold' : 'nav-tip__muted'}>
          {tooltip.pathReqs || 'none'}
        </Text>
      </Box>
    )}
    <Box className="nav-tip__row">
      <Text className="nav-tip__dim">live sprites:</Text>
      <Text className="nav-tip__muted">{tooltip.spriteInfo.length}</Text>
    </Box>
    <Box className="nav-tip__row">
      <Text className="nav-tip__dim">Blocked In Last Flood Fill:</Text>
      <Text className={tooltip.bfsBlocked ? 'nav-tip__danger' : 'nav-tip__muted'}>
        {tooltip.bfsBlocked ? 'yes' : 'no'}
      </Text>
    </Box>
    {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
      <Box key={i} className="nav-tip__warning">{line}</Box>
    ))}
  </>
);

export { TooltipExtraRows };
