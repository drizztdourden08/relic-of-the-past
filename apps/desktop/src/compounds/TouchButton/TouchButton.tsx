/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { PILL_HEIGHT_RATIO, PILL_WIDTH_RATIO } from './TouchButton.constants';
import type { TouchButtonProps } from './TouchButton.type';
import './TouchButton.css';

const TouchButton = (props: TouchButtonProps) => {
  const { label, shape, sizePx, center, pressed, strength, selected = false } = props;
  const width = shape === 'pill' ? sizePx * PILL_WIDTH_RATIO : sizePx;
  const height = shape === 'pill' ? sizePx * PILL_HEIGHT_RATIO : sizePx;
  const style = {
    left: center.x - width / 2,
    top: center.y - height / 2,
    width,
    height,
    '--touch-strength': strength,
  } as CSSProperties;

  return (
    <Box
      className="touch-button"
      style={style}
      data-shape={shape}
      data-pressed={pressed || undefined}
      data-selected={selected || undefined}
    >
      <Text className="touch-button__label">{label}</Text>
    </Box>
  );
};

export { TouchButton };
