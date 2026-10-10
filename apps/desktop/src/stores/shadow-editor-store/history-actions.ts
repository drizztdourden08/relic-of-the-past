/* @layer renderer-stores @kind logic */
import type { HistoryActions, ShadowEditorGet, ShadowEditorSet } from './shadow-editor-store.type';
import { ensureScreenData } from './ensure-screen-data';

const historyActions = (set: ShadowEditorSet, get: ShadowEditorGet): HistoryActions => ({
  undo: (screenId) => {
    const state = get();
    const prev = state.undoStack.at(-1);
    if (prev === undefined) return;
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
    const next = state.redoStack.at(-1);
    if (next === undefined) return;
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
