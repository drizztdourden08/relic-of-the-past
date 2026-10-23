/* @layer renderer-components @kind component */
import { Box, Svg, SvgLine, SvgRect, Text } from '@drizztdourden08/tessera/primitives';
import { SIGNED_VIEW_BOX } from './SignedBar.constants';
import type { SignedBarProps } from './SignedBar.type';
import './SignedBar.css';

const SignedBar = ({ label, value }: SignedBarProps) => {
  const clamped = Math.min(Math.max(value, -1), 1);
  return (
    <Box className="signed-bar">
      <Text className="signed-bar__label">{label}</Text>
      <Svg
        className="signed-bar__track"
        viewBox={SIGNED_VIEW_BOX}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} ${clamped.toFixed(2)}`}
      >
        <SvgRect className="signed-bar__fill" x={Math.min(0, clamped)} y={0} width={Math.abs(clamped)} height={1} />
        <SvgLine className="signed-bar__zero" x1={0} y1={0} x2={0} y2={1} vectorEffect="non-scaling-stroke" />
      </Svg>
      <Text className="signed-bar__value">{clamped.toFixed(2)}</Text>
    </Box>
  );
};

export { SignedBar };
