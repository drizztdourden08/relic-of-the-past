/* @layer renderer-components @kind hook */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { FileRenameParams } from './file-rename.type';

const useFileRename = (params: FileRenameParams) => {
  const { name, onRename } = params;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const cancelled = useRef(false);

  useEffect(() => { setDraft(name); }, [name]);

  const handleBlur = (): void => {
    setEditing(false);
    if (cancelled.current) { cancelled.current = false; setDraft(name); return; }
    const wanted = draft.trim();
    if (wanted !== name) onRename(name, wanted);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') event.currentTarget.blur();
    else if (event.key === 'Escape') { event.preventDefault(); cancelled.current = true; event.currentTarget.blur(); }
  };

  return { editing, setEditing, draft, setDraft, handleBlur, handleKeyDown };
};

export { useFileRename };
