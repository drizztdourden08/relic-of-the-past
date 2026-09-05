/* @layer renderer-components @kind component */
/**
 * Vertical fill bar showing analog trigger value.
 */

import type { CSSProperties } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { Step } from './useTriggerCalibration';

const S: Record<string, CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  label: { fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 600 },
  values: { fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
};

interface Props {
  value: number;
  label: string;
  height?: number;
  step: Step;
  deadzone: number;
}

const TriggerBar = (props: Props) => {
  const { value, label, height = 120, step, deadzone } = props;
  const fill = Math.max(0, Math.min(1, value));

  return (
    <Box style={S.col}>
      <Text style={S.label}>{label}</Text>
      <Box style={{
        width: 32, height, borderRadius: 4,
        background: 'var(--c-sunken)', border: '1px solid var(--c-border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${fill * 100}%`,
          background: fill > 0.9 ? 'var(--c-gold-bright)' : 'var(--c-gold)',
          transition: 'height 0.05s',
          borderRadius: '0 0 3px 3px',
        }} />
        {step === 'review' && deadzone > 0 && (
          <Box style={{
            position: 'absolute', bottom: `${deadzone * 100}%`, left: 0, right: 0,
            height: 1, background: 'var(--c-danger)', opacity: 0.6,
          }} />
        )}
      </Box>
      <Text style={S.values}>
        {value.toFixed(2)}
      </Text>
    </Box>
  );
};

export { TriggerBar };
