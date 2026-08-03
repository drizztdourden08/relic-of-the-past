/* @layer renderer-components @kind component */
import './Checkbox.css';
import type { CheckboxProps } from './Checkbox.type';

const Checkbox = (props: CheckboxProps) => {
  const { checked, onChange, label, ariaLabel, disabled, className = '' } = props;
  return (
    <label className={`checkbox${disabled ? ' checkbox--disabled' : ''}${className ? ` ${className}` : ''}`}>
      <input
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
