/* @layer renderer-components @kind component */
import './Checkbox.css';
import type { CheckboxProps } from './types';

const Checkbox = (props: CheckboxProps) => {
  const { checked, onChange, label, disabled, className = '' } = props;
  return (
    <label className={`checkbox${disabled ? ' checkbox--disabled' : ''}${className ? ` ${className}` : ''}`}>
      <input
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label != null && <span className="checkbox__label">{label}</span>}
    </label>
  );
};

export { Checkbox };
