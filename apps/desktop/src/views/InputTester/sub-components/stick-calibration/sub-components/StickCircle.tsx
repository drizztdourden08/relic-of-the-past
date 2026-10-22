/* @layer renderer-components @kind component */
import { Box, Text, Svg, SvgLine, SvgCircle } from '@drizztdourden08/tessera/primitives';
import { STICK_CIRCLE_INSET, STICK_CIRCLE_LARGE_SIZE, STICK_CIRCLE_SIZE } from '../stick-calibration.constants';
import type { StickCircleProps } from '../stick-calibration.type';

const StickCircle = (props: StickCircleProps) => {
  const { x, y, label, large = false, innerDeadzone = 0, outerDeadzone = 1, showDeadzones = false } = props;
  const size = large ? STICK_CIRCLE_LARGE_SIZE : STICK_CIRCLE_SIZE;
  const r = (size - STICK_CIRCLE_INSET) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const dotX = cx + Math.max(-1, Math.min(1, x)) * r;
  const dotY = cy + Math.max(-1, Math.min(1, y)) * r;

  return (
    <Box className="stick-cal__circle-col">
      <Text className="stick-cal__circle-label">{label}</Text>
      <Box className={large ? 'stick-cal__ring stick-cal__ring--large' : 'stick-cal__ring'}>
        <Svg width={size} height={size} className="stick-cal__svg">
          <SvgLine x1={0} y1={cy} x2={size} y2={cy} stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1={cx} y1={0} x2={cx} y2={size} stroke="var(--c-border)" strokeWidth="1" />
          {showDeadzones && (
            <SvgCircle cx={cx} cy={cy} r={r * innerDeadzone} fill="none"
              stroke="var(--c-danger)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
          )}
          {showDeadzones && (
            <SvgCircle cx={cx} cy={cy} r={r * outerDeadzone} fill="none"
              stroke="var(--c-primary)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
          )}
          <SvgLine x1={cx} y1={cy} x2={dotX} y2={dotY}
            stroke="var(--c-primary)" strokeWidth="2" strokeLinecap="round" />
          <SvgCircle cx={dotX} cy={dotY} r={5} fill="var(--c-primary-bright)" />
        </Svg>
      </Box>
      <Text className="stick-cal__circle-values">
        {x.toFixed(2)}, {y.toFixed(2)}
      </Text>
    </Box>
  );
};

export { StickCircle };
