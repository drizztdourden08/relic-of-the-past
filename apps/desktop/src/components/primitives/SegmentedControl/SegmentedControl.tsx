import './SegmentedControl.css';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string = string> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string = string>({
  value,
  options,
  onChange,
  label,
  description,
  disabled = false,
}: SegmentedControlProps<T>) {
  const activeIdx = options.findIndex((o) => o.value === value);

  return (
    <div className={`segmented ${disabled ? 'segmented--disabled' : ''}`}>
      {(label || description) && (
        <div className="segmented__header">
          {label && <span className="segmented__label">{label}</span>}
          {description && <span className="segmented__description">{description}</span>}
        </div>
      )}
      <div className="segmented__track" role="radiogroup" aria-label={label}>
        <span
          className="segmented__indicator"
          style={{
            width: `${100 / options.length}%`,
            transform: `translateX(${activeIdx * 100}%)`,
          }}
        />
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={`segmented__btn ${value === opt.value ? 'segmented__btn--active' : ''}`}
            onClick={() => onChange(opt.value)}
            disabled={disabled}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
