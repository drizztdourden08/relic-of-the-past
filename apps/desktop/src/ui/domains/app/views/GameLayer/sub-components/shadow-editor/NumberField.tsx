/* @layer renderer-components @kind component */
import { useCallback, useRef, useState, useEffect } from 'react';
import { TextInput } from '../../../../../../design-system/primitives/TextInput';
import './NumberField.css';

interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  icon?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

const NumberField = ({ value, onChange, label, icon, min, max, step = 1, suffix }: NumberFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = suffix ? `${Math.round(value)}${suffix}` : String(Math.round(value * 100) / 100);

  const commit = useCallback(() => {
    const n = parseFloat(text);
    if (!isNaN(n)) {
      let clamped = n;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
    }
    setEditing(false);
  }, [text, min, max, onChange]);

  const startEdit = useCallback(() => {
    setText(String(Math.round(value * 100) / 100));
    setEditing(true);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Scrub on drag
  const scrubRef = useRef({ startX: 0, startVal: 0, active: false });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (editing) return;
    scrubRef.current = { startX: e.clientX, startVal: value, active: true };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editing, value]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!scrubRef.current.active) return;
    const dx = e.clientX - scrubRef.current.startX;
    const sensitivity = e.shiftKey ? 0.1 : 1;
    let newVal = scrubRef.current.startVal + dx * step * sensitivity;
    if (min !== undefined) newVal = Math.max(min, newVal);
    if (max !== undefined) newVal = Math.min(max, newVal);
    onChange(Math.round(newVal / step) * step);
  }, [step, min, max, onChange]);

  const onPointerUp = useCallback(() => {
    scrubRef.current.active = false;
  }, []);

  return (
    <div className="number-field">
      {(icon || label) && (
        <span className="number-field__label">{icon || label}</span>
      )}
      {editing ? (
        <TextInput
          ref={inputRef}
          className="number-field__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <span
          className="number-field__value"
          onDoubleClick={startEdit}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
};

export { NumberField };
