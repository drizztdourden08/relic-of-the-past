/* @layer renderer-components @kind hook */
import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

const useRename = (name: string, onEnd: (next: string | null) => void) => {
  const [value, setValue] = useState(name);
  const ended = useRef(false);

  const end = (next: string | null) => {
    if (ended.current) return;
    ended.current = true;
    onEnd(next);
  };

  const commit = () => {
    const trimmed = value.trim();
    end(trimmed && trimmed !== name ? trimmed : null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') {
      event.preventDefault();
      end(null);
    }
  };

  return { value, setValue, commit, handleKeyDown };
};

export { useRename };
