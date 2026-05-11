import './Toggle.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({ checked, onChange, label, description, disabled = false, id }: ToggleProps) {
  const toggleId = id ?? `toggle-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'unnamed'}`;

  return (
    <label className={`toggle ${disabled ? 'toggle--disabled' : ''}`} htmlFor={toggleId}>
      {(label || description) && (
        <span className="toggle__text">
          {label && <span className="toggle__label">{label}</span>}
          {description && <span className="toggle__description">{description}</span>}
        </span>
      )}
      <input
        id={toggleId}
        type="checkbox"
        className="toggle__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      />
      <span className="toggle__track">
        <span className="toggle__thumb" />
      </span>
    </label>
  );
}
