/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { FocusEvent, KeyboardEvent, RefObject } from 'react';
import type { SaveListProps } from '../SaveList.type';
import { focusRow } from './focus-row';
import { isUndoKey } from './is-undo-key';
import { rowIdOf } from './row-id-of';
import { rowKeyAction } from './row-key-action';

const useSaveListKeys = (props: SaveListProps, listRef: RefObject<HTMLElement | null>) => {
  const { ids, onSelect, onDelete, onRename, onUndo } = props;

  const moveTo = useCallback((id: string | undefined) => {
    if (id === undefined) return;
    onSelect(id);
    requestAnimationFrame(() => focusRow(listRef.current, id));
  }, [onSelect, listRef]);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const id = rowIdOf(event.target);
    if (id === null) return;
    if (event.target instanceof HTMLInputElement) {
      if (event.key === 'Enter' || event.key === 'Escape') moveTo(id);
      return;
    }
    const action = isUndoKey(event) ? onUndo : rowKeyAction({ key: event.key, id, ids, onDelete, onRename, moveTo });
    if (!action) return;
    event.preventDefault();
    action();
  }, [ids, onDelete, onRename, onUndo, moveTo]);

  const onFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    const id = rowIdOf(event.target);
    if (id !== null && ids.includes(id)) onSelect(id);
  }, [ids, onSelect]);

  return { onKeyDown, onFocus };
};

export { useSaveListKeys };
