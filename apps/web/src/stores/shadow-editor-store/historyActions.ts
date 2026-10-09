/* @layer renderer-stores @kind logic */
import type { HistoryActions, ShadowEditorGet, ShadowEditorSet } from './shadow-editor-store.type';
import { ensureScreenData } from './ensureScreenData';

const historyActions = (set: ShadowEditorSet, get: ShadowEditorGet): HistoryActions => ({
  undo: (screenId) => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    const currentScreenData = ensureScreenData(state.project, screenId);
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: prev } },
      dirty: true,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentScreenData],
    });
  },

  redo: (screenId) => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    const currentScreenData = ensureScreenData(state.project, screenId);
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: next } },
      dirty: true,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, currentScreenData],
    });
  },
});

export { historyActions };
