/* @layer renderer-components @kind logic */
import type { OverlayKeyAction } from './overlay-key-action.type';
import type { ShadowEditorState } from './store-state.type';

const deleteSelection = (e: KeyboardEvent, store: ShadowEditorState, screenId: number): void => {
  const id = store.selectedElementId;
  if (!id) return;
  e.preventDefault();
  if (store.selectedType === 'heightmap') store.removeHeightmapElement(screenId, id);
  else if (store.selectedType === 'light') store.removeLight(screenId, id);
};

const applyOverlayKey = (action: OverlayKeyAction, e: KeyboardEvent, store: ShadowEditorState, screenId: number): void => {
  if (action === 'undo') {
    e.preventDefault();
    store.undo(screenId);
  } else if (action === 'redo') {
    e.preventDefault();
    store.redo(screenId);
  } else if (action === 'delete') {
    deleteSelection(e, store, screenId);
  } else if (action === 'save') {
    e.preventDefault();
    void store.save();
  } else {
    store.setActiveTool('select');
    store.setSelectedElement(null, null);
  }
};

export { applyOverlayKey };
