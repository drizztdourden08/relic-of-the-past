/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { TouchButtonProps } from './TouchButton.type';
import './TouchButton.css';

const TouchButton = (props: TouchButtonProps) => {
  const { label, form, sizePx, center, pressed, strength, selected = false } = props;
  const width = sizePx * form.width;
  const height = sizePx * form.height;
  const style = {
    left: center.x - width / 2,
    top: center.y - height / 2,
    width,
    height,
    borderRadius: (form.radius * Math.min(width, height)) / 2,
    '--touch-strength': strength,
    '--touch-height': `${height}px`,
  } as CSSProperties;

  return (
    <Box
      className="touch-button"
      style={style}
      data-pressed={pressed || undefined}
      data-selected={selected || undefined}
    >
      <Text className="touch-button__label">{label}</Text>
    </Box>
  );
};

export { TouchButton };
