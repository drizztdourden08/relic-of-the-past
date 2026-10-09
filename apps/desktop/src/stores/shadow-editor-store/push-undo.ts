/* @layer renderer-stores @kind logic */
import type { ShadowEditorStore, UndoPatch } from './shadow-editor-store.type';
import { UNDO_DEPTH } from './shadow-editor-store.constants';
import { ensureScreenData } from './ensure-screen-data';

const pushUndo = (state: ShadowEditorStore, screenId: number): UndoPatch => {
  const current = ensureScreenData(state.project, screenId);
  return {
    undoStack: [...state.undoStack.slice(-UNDO_DEPTH), current],
    redoStack: [],
  };
};

export { pushUndo };
