/* @layer renderer-components @kind component */
import { useEffect, useRef } from 'react';
import './Checkbox.css';
import type { CheckboxProps } from './Checkbox.type';

const Checkbox = (props: CheckboxProps) => {
  const { checked, onChange, label, ariaLabel, disabled, indeterminate = false, className = '' } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  // The mixed state has no attribute; it lives on the element only.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={`checkbox${disabled ? ' checkbox--disabled' : ''}${className ? ` ${className}` : ''}`}>
      <input
        ref={inputRef}
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label != null && <span className="checkbox__label">{label}</span>}
    </label>
  );
};

export { Checkbox };
