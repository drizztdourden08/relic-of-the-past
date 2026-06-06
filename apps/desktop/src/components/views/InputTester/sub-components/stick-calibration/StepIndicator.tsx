/**
 * StepIndicator — numbered step progress for the calibration wizard.
 */

import type { Step } from './types';

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
    <div style={{
      display: 'flex', gap: 8, margin: '8px 0 12px',
      fontSize: 12, fontWeight: 600,
    }}>
      {STEPS.map((s, i) => (
        <div key={s.key} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: currentStep === s.key ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: currentStep === s.key ? 'var(--color-gold-base)' : 'var(--color-bg-inset)',
            color: currentStep === s.key ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
            fontSize: 11,
          }}>{i + 1}</span>
          {s.label}
        </div>
      ))}
    </div>
  );
};

export { StepIndicator };
