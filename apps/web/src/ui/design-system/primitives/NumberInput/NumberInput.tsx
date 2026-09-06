/* @layer renderer-components @kind component */
import './NumberInput.css';
import { Icon } from '../Icon';
import type { CSSProperties } from 'react';
import type { NumberInputProps } from './NumberInput.type';

// Chevron glyphs (stroked, on a 16-grid).
const CHEVRON_UP = 'M3.5 9.75 8 5.25l4.5 4.5';
const CHEVRON_DOWN = 'M3.5 6.25 8 10.75l4.5-4.5';

const toNum = (v: unknown): number | undefined => {
  const n = Number(v);
  return v === undefined || v === '' || Number.isNaN(n) ? undefined : n;
};

const NumberInput = (props: NumberInputProps) => {
  const { onChange, className = '', value, min, max, step, disabled = false, sizeToContent = false, ...rest } = props;

  const stepBy = (dir: 1 | -1): void => {
    const stepN = toNum(step) ?? 1;
    const minN = toNum(min);
    const maxN = toNum(max);
    const cur = toNum(value) ?? minN ?? 0;
    let next = cur + dir * stepN;
    if (minN !== undefined && next < minN) next = minN;
    if (maxN !== undefined && next > maxN) next = maxN;
    onChange?.(Number(next.toFixed(6)));
  };

  // Digit columns the field must show, taken from |max| so the widest legal value fits.
  // Only the FIELD gets sized, never the wrapper: the wrapper is an inline-flex row that also holds
  // the spinner column, so a width there is split between the two. The field carries
  // min-width:0, so it collapses to nothing while the chevrons keep their padding.
  const digitColumns = (): number | undefined => {
    if (!sizeToContent) return undefined;
    const maxNum = toNum(max);
    if (maxNum === undefined) return undefined;
    const whole = Math.max(1, Math.abs(maxNum).toString().length);
    // A fractional step means fractional values, which need room for the point and the digits after
    // it. Sizing from |max| alone would fit "10" and clip the "10.5" the same field now accepts.
    const stepN = toNum(step);
    const places = stepN !== undefined && !Number.isInteger(stepN)
      ? (String(stepN).split('.')[1]?.length ?? 1)
      : 0;
    return whole + (places > 0 ? places + 1 : 0);
  };

  const columns = digitColumns();
  const sizingVars = columns === undefined
    ? undefined
    : ({ '--number-input-columns': String(columns) } as CSSProperties);

  return (
    <div
      className={`number-input ${columns === undefined ? '' : 'number-input--auto'} ${disabled ? 'number-input--disabled' : ''} ${className}`}
      style={sizingVars}
    >
      <input
        type="number"
        className="number-input__field"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.valueAsNumber)}
        {...rest}
      />
      <div className="number-input__spin">
        <button type="button" className="number-input__btn" tabIndex={-1} aria-label="Increment" disabled={disabled} onClick={() => stepBy(1)}>
          <Icon size={12} paths={[CHEVRON_UP]} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </button>
        <button type="button" className="number-input__btn" tabIndex={-1} aria-label="Decrement" disabled={disabled} onClick={() => stepBy(-1)}>
          <Icon size={12} paths={[CHEVRON_DOWN]} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </button>
      </div>
    </div>
  );
};

export { NumberInput };
