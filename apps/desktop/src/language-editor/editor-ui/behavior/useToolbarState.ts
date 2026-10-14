/* @layer renderer-components @kind hook */
import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useDismissListeners } from '@drizztdourden08/tessera/primitives';
import type { Token } from '@rotp/languages';
import { END_BOX, REDO, UNDO } from '../EditorToolbar.constants';
import { hasOpenDropdown } from '../popovers';
import type { ToolbarStateParams } from './toolbar-state.type';

const useToolbarState = (params: ToolbarStateParams) => {
  const { onUndo, onRedo, onEndBox, onInsert } = params;
  const rootRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const handleDismiss = useCallback(() => {
    if (hasOpenDropdown()) return;
    setOpen(null);
  }, []);
  useDismissListeners({ open: open !== null, onClose: handleDismiss, contentRef: rootRef, triggerRef: rootRef, escape: false });

  const handlePress = useCallback((id: string) => {
    if (id === UNDO) return onUndo();
    if (id === REDO) return onRedo();
    if (id === END_BOX) return onEndBox();
    return setOpen((current) => (current === id ? null : id));
  }, [onUndo, onRedo, onEndBox]);

  const handleInsert = useCallback((tokens: Token[]) => {
    setOpen(null);
    onInsert(tokens);
  }, [onInsert]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    setOpen(null);
  }, []);

  return { rootRef, open, handlePress, handleInsert, handleKeyDown };
};

export { useToolbarState };
