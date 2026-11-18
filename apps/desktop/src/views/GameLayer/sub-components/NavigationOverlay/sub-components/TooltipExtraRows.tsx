/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ExtraRowsProps, TooltipData } from '@app/navigation-overlay/tooltip/tooltip.type';

const isAnyLayerReachable = (tooltip: TooltipData): boolean => {
  const { layers } = tooltip;
  return layers.mode === 'dual'
    ? layers.ground.reach !== 0 || layers.above.reach !== 0
    : layers.primary.reach !== 0;
};

const TooltipExtraRows = ({ tooltip }: ExtraRowsProps) => {
  const t = useT();
  return (
  <>
    {isAnyLayerReachable(tooltip) && (
      <Box className="nav-tip__row">
        <Text className="nav-tip__dim">{t('views-game-layer:tooltip.pathReqs')}</Text>
        <Text className={tooltip.pathReqs ? 'nav-tip__gold' : 'nav-tip__muted'}>
          {tooltip.pathReqs || t('views-game-layer:tooltip.none')}
        </Text>
      </Box>
    )}
    <Box className="nav-tip__row">
      <Text className="nav-tip__dim">{t('views-game-layer:tooltip.liveSprites')}</Text>
      <Text className="nav-tip__muted">{tooltip.spriteInfo.length}</Text>
    </Box>
    <Box className="nav-tip__row">
      <Text className="nav-tip__dim">{t('views-game-layer:tooltip.blocked')}</Text>
      <Text className={tooltip.bfsBlocked ? 'nav-tip__danger' : 'nav-tip__muted'}>
        {tooltip.bfsBlocked ? t('views-game-layer:tooltip.yes') : t('views-game-layer:tooltip.no')}
      </Text>
    </Box>
    {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
      <Box key={i} className="nav-tip__warning">{line}</Box>
    ))}
  </>
  );
};

export { TooltipExtraRows };
