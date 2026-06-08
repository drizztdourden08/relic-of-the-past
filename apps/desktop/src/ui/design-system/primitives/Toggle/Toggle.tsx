/* @layer renderer-components @kind data */
﻿import './Toggle.css';
import { type ToggleProps } from './types';


const Toggle = (props: ToggleProps) => {
  const { checked, onChange, label, description, disabled = false, id, link } = props;
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
};

export {
  Toggle,
};
