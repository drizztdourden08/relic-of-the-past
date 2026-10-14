/* @layer renderer-components @kind logic */
import type { OverlayKeyAction } from './overlay-key-action.type';

const isRedoKey = (e: KeyboardEvent): boolean => e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'));

const overlayKeyAction = (e: KeyboardEvent): OverlayKeyAction | null => {
  if (e.ctrlKey && e.key === 'z') return 'undo';
  if (isRedoKey(e)) return 'redo';
  if (e.key === 'Delete' || e.key === 'Backspace') return 'delete';
  if (e.ctrlKey && e.key === 's') return 'save';
  if (e.key === 'Escape') return 'escape';
  return null;
};

export { overlayKeyAction };
