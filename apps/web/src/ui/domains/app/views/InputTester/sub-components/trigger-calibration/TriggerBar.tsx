/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { PERCENT } from '../calibration-parts';
import { FULL_PRESS_HIGHLIGHT, TRIGGER_WIZARD_STYLE } from './trigger-calibration.constants';
import type { TriggerBarProps } from './trigger-calibration.type';

const TriggerBar = (props: TriggerBarProps) => {
  const { value, label, height = 120, step, deadzone } = props;
  const fill = Math.max(0, Math.min(1, value));

  const trackStyle = useMemo(() => ({
    width: 32, height, borderRadius: 4,
    background: 'var(--c-sunken)', border: '1px solid var(--c-border)',
    position: 'relative' as const, overflow: 'hidden' as const,
  }), [height]);

  const fillStyle = useMemo(() => ({
    position: 'absolute' as const, bottom: 0, left: 0, right: 0,
    height: `${fill * PERCENT}%`,
    background: fill > FULL_PRESS_HIGHLIGHT ? 'var(--c-primary-bright)' : 'var(--c-primary)',
    transition: 'height 0.05s',
    borderRadius: '0 0 3px 3px',
  }), [fill]);

  const deadzoneStyle = useMemo(() => ({
    position: 'absolute' as const, bottom: `${deadzone * PERCENT}%`, left: 0, right: 0,
    height: 1, background: 'var(--c-danger)', opacity: 0.6,
  }), [deadzone]);

  return (
    <Box style={TRIGGER_WIZARD_STYLE.barCol}>
      <Text style={TRIGGER_WIZARD_STYLE.barLabel}>{label}</Text>
      <Box style={trackStyle}>
        <Box style={fillStyle} />
        {step === 'review' && deadzone > 0 && <Box style={deadzoneStyle} />}
      </Box>
      <Text style={TRIGGER_WIZARD_STYLE.barValues}>
        {value.toFixed(2)}
      </Text>
    </Box>
  );
};

export { TriggerBar };
