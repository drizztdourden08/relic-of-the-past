/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { clampValue } from './clamp-value';
import type { NumberFieldEditingParams } from './number-field.type';

const useNumberFieldEditing = (params: NumberFieldEditingParams) => {
  const { value, min, max, onChange } = params;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = useCallback(() => {
    const n = parseFloat(text);
    if (!isNaN(n)) onChange(clampValue(n, min, max));
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

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value), []);
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditing(false);
    }
  }, [commit]);

  return { editing, text, inputRef, commit, startEdit, handleTextChange, handleKeyDown };
};

export { useNumberFieldEditing };
