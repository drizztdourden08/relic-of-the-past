/* @layer renderer-components @kind component */
/**
 * TriggerBar — vertical fill bar showing analog trigger value.
 */

import type { Step } from './useTriggerCalibration';

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{label}</span>
      <div style={{
        width: 32, height, borderRadius: 4,
        background: 'var(--color-bg-inset)', border: '1px solid var(--color-border-subtle)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${fill * 100}%`,
          background: fill > 0.9 ? 'var(--color-gold-bright)' : 'var(--color-gold-base)',
          transition: 'height 0.05s',
          borderRadius: '0 0 3px 3px',
        }} />
        {step === 'review' && deadzone > 0 && (
          <div style={{
            position: 'absolute', bottom: `${deadzone * 100}%`, left: 0, right: 0,
            height: 1, background: 'var(--color-danger-base)', opacity: 0.6,
          }} />
        )}
      </div>
      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
        {value.toFixed(2)}
      </span>
    </div>
  );
};

export { TriggerBar };
