/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { TriggerBarProps } from './input-cal-visuals.type';

const TriggerBar = ({ value, label, pressed }: TriggerBarProps) => {
  const clamped = Math.max(0, Math.min(1, value));
  const fill = { '--trigger-fill': clamped } as CSSProperties;
  const state = pressed ? ' input-cal__trigger--pressed' : '';
  return (
    <Box className="input-cal__stick-container">
      <Text className="input-cal__stick-label">{label}</Text>
      <Box className={`input-cal__trigger-track${state}`}>
        <Box className={`input-cal__trigger-fill${state}`} style={fill} />
      </Box>
      <Text className="input-cal__stick-values">{clamped.toFixed(2)}</Text>
    </Box>
  );
};

export { TriggerBar };
