/* @layer renderer-components @kind hook */
import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

const useRename = (name: string, onCommit: (next: string) => void) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    setValue(name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onCommit(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') { event.preventDefault(); setEditing(false); }
  };

  return { editing, value, setValue, inputRef, start, commit, handleKeyDown };
};

export { useRename };
