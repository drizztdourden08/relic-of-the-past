/* @layer renderer-components @kind data */
﻿import './Toggle.css';
import { useId } from 'react';
import { type ToggleProps } from './Toggle.type';


const Toggle = (props: ToggleProps) => {
  const { checked, onChange, label, description, disabled = false, id, link } = props;
  // Per-instance fallback id: a shared fallback (or two toggles with the same
  // label) makes every wrapping label's htmlFor resolve to the FIRST matching
  // input in the document, so clicking one toggle silently flips another.
  const generatedId = useId();
  const toggleId = id ?? `toggle-${generatedId}`;

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
