/* @layer renderer-components @kind component */
/** Numeric stepper — text field with explicit −/+ buttons. Avoids the native
 *  <input type="number"> spinner, whose auto-repeat runs away when a re-render
 *  swallows the mouseup. */
import './Stepper.css';
import type { StepperProps } from './Stepper.type';

const clampValue = (v: number, min?: number, max?: number): number => {
  if (min !== undefined && v < min) return min;
  if (max !== undefined && v > max) return max;
  return v;
};

const Stepper = (props: StepperProps) => {
  const { value, onChange, min, max, step = 1, disabled = false, ariaLabel, className = '' } = props;

  const stepBy = (dir: 1 | -1): void => {
    const base = Number.isNaN(value) ? (min ?? 0) : value;
    const next = clampValue(Math.round((base + dir * step) / step) * step, min, max);
    onChange(Number(next.toFixed(6)));
  };

  const handleType = (raw: string): void => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    onChange(cleaned === '' ? Number.NaN : Number(cleaned));
  };

  return (
    <div className={`stepper ${disabled ? 'stepper--disabled' : ''} ${className}`}>
      <button type="button" className="stepper__btn" aria-label="Decrease" disabled={disabled} onClick={() => stepBy(-1)}>−</button>
      <input
        type="text"
        inputMode="numeric"
        className="stepper__field"
        aria-label={ariaLabel}
        disabled={disabled}
        value={Number.isNaN(value) ? '' : String(value)}
        onChange={(e) => handleType(e.target.value)}
      />
      <button type="button" className="stepper__btn" aria-label="Increase" disabled={disabled} onClick={() => stepBy(1)}>+</button>
    </div>
  );
};

export { Stepper };
export type { StepperProps };
