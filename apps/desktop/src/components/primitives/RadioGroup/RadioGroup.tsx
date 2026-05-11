import './RadioGroup.css';

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioGroupProps<T extends string = string> {
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  description?: string;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  name?: string;
}

export function RadioGroup<T extends string = string>({
  value,
  options,
  onChange,
  label,
  description,
  direction = 'horizontal',
  disabled = false,
  name,
}: RadioGroupProps<T>) {
  const groupName = name ?? `radio-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'group'}`;

  return (
    <fieldset className={`radio-group ${disabled ? 'radio-group--disabled' : ''}`}>
      {(label || description) && (
        <div className="radio-group__header">
          {label && <legend className="radio-group__label">{label}</legend>}
          {description && <span className="radio-group__description">{description}</span>}
        </div>
      )}
      <div className={`radio-group__options radio-group__options--${direction}`}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`radio-group__option ${value === opt.value ? 'radio-group__option--active' : ''}`}
          >
            <input
              type="radio"
              className="radio-group__input"
              name={groupName}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              disabled={disabled}
            />
            <span className="radio-group__indicator" />
            <span className="radio-group__option-text">
              <span className="radio-group__option-label">{opt.label}</span>
              {opt.description && (
                <span className="radio-group__option-desc">{opt.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
