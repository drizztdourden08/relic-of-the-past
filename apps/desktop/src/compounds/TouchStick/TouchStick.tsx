/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { KNOB_RATIO } from './TouchStick.constants';
import type { TouchStickProps } from './TouchStick.type';
import './TouchStick.css';

const TouchStick = (props: TouchStickProps) => {
  const { base, knob, radiusPx, strength, active } = props;
  const knobRadius = radiusPx * KNOB_RATIO;
  const ringStyle = {
    left: base.x - radiusPx,
    top: base.y - radiusPx,
    width: radiusPx * 2,
    height: radiusPx * 2,
    '--touch-strength': strength,
  } as CSSProperties;
  const knobStyle = {
    left: knob.x - knobRadius,
    top: knob.y - knobRadius,
    width: knobRadius * 2,
    height: knobRadius * 2,
    '--touch-strength': strength,
  } as CSSProperties;

  return (
    <>
      <Box className="touch-stick__ring" style={ringStyle} data-active={active || undefined} />
      <Box className="touch-stick__knob" style={knobStyle} data-active={active || undefined} />
    </>
  );
};

export { TouchStick };
