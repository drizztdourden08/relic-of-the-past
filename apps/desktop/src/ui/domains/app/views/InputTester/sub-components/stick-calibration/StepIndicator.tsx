/* @layer renderer-components @kind component */
/**
 * StepIndicator — numbered step progress for the calibration wizard.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { Step } from './stick-calibration.type';

interface StepIndicatorProps {
  currentStep: Step;
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'center', label: 'Center' },
  { key: 'range', label: 'Range' },
  { key: 'review', label: 'Review' },
];

const StepIndicator = (props: StepIndicatorProps) => {
  const { currentStep } = props;

  return (
    <Box style={{
      display: 'flex', gap: 8, margin: '8px 0 12px',
      fontSize: 12, fontWeight: 600,
    }}>
      {STEPS.map((s, i) => (
        <Box key={s.key} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: currentStep === s.key ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
        }}>
          <Text style={{
            width: 20, height: 20, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: currentStep === s.key ? 'var(--color-gold-base)' : 'var(--color-bg-inset)',
            color: currentStep === s.key ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
            fontSize: 11,
          }}>{i + 1}</Text>
          {s.label}
        </Box>
      ))}
    </Box>
  );
};

export { StepIndicator };
