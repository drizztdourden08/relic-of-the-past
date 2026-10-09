/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import { Svg, SvgLine, SvgCircle } from '../../../../../../design-system/primitives/Svg';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import { resolveStickDirectionIcon } from '@shared/input/family';
import { STICK_VIEW_CENTER, STICK_VIEW_RADIUS, VIS_STYLES } from './input-cal-visuals.constants';
import type { StickCircleProps } from './input-cal-visuals.type';

const StickCircle = ({ x, y, label, iconPrefix }: StickCircleProps) => {
  const clampX = Math.max(-1, Math.min(1, x));
  const clampY = Math.max(-1, Math.min(1, y));
  const dotX = STICK_VIEW_CENTER + clampX * STICK_VIEW_RADIUS;
  const dotY = STICK_VIEW_CENTER + clampY * STICK_VIEW_RADIUS;
  const iconUrl = iconPrefix ? getButtonIconUrl(resolveStickDirectionIcon(iconPrefix, clampX, clampY)) : null;

  return (
    <Box className="input-cal__stick-container">
      <Text className="input-cal__stick-label">{label}</Text>
      <Box className="input-cal__stick-circle">
        <Svg width="80" height="80" style={VIS_STYLES.svgAbs}>
          <SvgLine x1="0" y1="40" x2="80" y2="40" stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1="40" y1="0" x2="40" y2="80" stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1="40" y1="40" x2={dotX} y2={dotY} stroke="var(--c-gold)" strokeWidth="2" strokeLinecap="round" />
          <SvgCircle cx={dotX} cy={dotY} r="5" fill="var(--c-gold-bright)" />
        </Svg>
      </Box>
      <Text className="input-cal__stick-values">
        {clampX.toFixed(2)}, {clampY.toFixed(2)}
      </Text>
      {iconUrl ? (
        <Image src={iconUrl} alt="" draggable={false} style={VIS_STYLES.dirIcon} />
      ) : null}
    </Box>
  );
};

export { StickCircle };
