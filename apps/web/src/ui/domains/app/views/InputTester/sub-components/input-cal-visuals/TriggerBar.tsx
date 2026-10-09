/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { TRIGGER_BAR_HEIGHT, VIS_STYLES } from './input-cal-visuals.constants';
import type { TriggerBarProps } from './input-cal-visuals.type';

const TriggerBar = ({ value, label, pressed }: TriggerBarProps) => {
  const clamped = Math.max(0, Math.min(1, value));
  const fillH = clamped * TRIGGER_BAR_HEIGHT;
  const track = useMemo(() => ({
    ...VIS_STYLES.triggerTrack,
    border: pressed ? '1px solid var(--c-green-bright)' : '1px solid var(--c-border)',
    boxShadow: pressed ? '0 0 0 1px var(--c-green-bright)' : 'none',
  }), [pressed]);
  const fill = useMemo(() => ({
    position: 'absolute' as const, bottom: 0, left: 0, right: 0,
    height: fillH,
    background: pressed ? 'var(--c-green-bright)' : 'var(--c-gold-bright)',
    borderRadius: '0 0 3px 3px',
    transition: 'height 0.05s linear',
  }), [fillH, pressed]);
  return (
    <Box className="input-cal__stick-container">
      <Text className="input-cal__stick-label">{label}</Text>
      <Box style={track}>
        <Box style={fill} />
      </Box>
      <Text className="input-cal__stick-values">{clamped.toFixed(2)}</Text>
    </Box>
  );
};

export { TriggerBar };
