/* @layer renderer-components @kind logic */
import type { SaveRowNotice } from '@app/compounds/SaveRow';
import type { UndoWindow } from './undo.type';

const noticeOf = (undo: UndoWindow, key: string): SaveRowNotice | null => {
  const kind = undo.notices[key];
  return kind ? { kind, onUndo: () => undo.undo(key) } : null;
};

export { noticeOf };
