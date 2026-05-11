import './Toggle.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  /** Optional external link shown next to the description */
  link?: string;
}

export function Toggle({ checked, onChange, label, description, disabled = false, id, link }: ToggleProps) {
  const toggleId = id ?? `toggle-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'unnamed'}`;

  return (
    <label className={`toggle ${disabled ? 'toggle--disabled' : ''}`} htmlFor={toggleId}>
      {(label || description) && (
        <span className="toggle__text">
          {label && <span className="toggle__label">{label}</span>}
          {description && (
            <span className="toggle__description">
              {description}
              {link && (
                <a
                  className="toggle__link"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Learn more"
                >
                  ↗
                </a>
              )}
            </span>
          )}
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
