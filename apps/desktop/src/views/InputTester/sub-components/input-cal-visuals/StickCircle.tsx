/* @layer renderer-components @kind component */
import { Box, Text, Image, Svg, SvgLine, SvgCircle } from '@drizztdourden08/tessera/primitives';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { resolveStickDirectionIcon } from '@rotp/input-mapping';
import { STICK_VIEW_CENTER, STICK_VIEW_RADIUS, STICK_VIEW_SIZE } from './input-cal-visuals.constants';
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
        <Svg width={STICK_VIEW_SIZE} height={STICK_VIEW_SIZE} className="input-cal__stick-svg">
          <SvgLine x1={0} y1={STICK_VIEW_CENTER} x2={STICK_VIEW_SIZE} y2={STICK_VIEW_CENTER} stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1={STICK_VIEW_CENTER} y1={0} x2={STICK_VIEW_CENTER} y2={STICK_VIEW_SIZE} stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1={STICK_VIEW_CENTER} y1={STICK_VIEW_CENTER} x2={dotX} y2={dotY} stroke="var(--c-primary)" strokeWidth="2" strokeLinecap="round" />
          <SvgCircle cx={dotX} cy={dotY} r="5" fill="var(--c-primary-bright)" />
        </Svg>
      </Box>
      <Text className="input-cal__stick-values">
        {clampX.toFixed(2)}, {clampY.toFixed(2)}
      </Text>
      {iconUrl ? (
        <Image src={iconUrl} alt="" draggable={false} className="input-cal__stick-dir-icon" />
      ) : null}
    </Box>
  );
};

export { StickCircle };
