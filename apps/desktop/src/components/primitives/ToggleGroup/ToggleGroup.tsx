/* @layer renderer-components @kind component */
import './ToggleGroup.css';

interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface ToggleGroupProps<T extends string = string> {
  value: T[];
  options: ToggleOption<T>[];
  onChange: (value: T[]) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const ToggleGroup = <T extends string = string>(props: ToggleGroupProps<T>) => {
  const { value, options, onChange, label, description, disabled = false } = props;

  const toggle = (v: T) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  return (
    <div className={`toggle-group ${disabled ? 'toggle-group--disabled' : ''}`}>
      {(label || description) && (
        <div className="toggle-group__header">
          {label && <span className="toggle-group__label">{label}</span>}
          {description && <span className="toggle-group__description">{description}</span>}
        </div>
      )}
      <div className="toggle-group__track" role="group" aria-label={label}>
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              className={`toggle-group__btn ${active ? 'toggle-group__btn--active' : ''}`}
              onClick={() => toggle(opt.value)}
              disabled={disabled || opt.disabled}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { ToggleGroup };
export type { ToggleOption, ToggleGroupProps };
