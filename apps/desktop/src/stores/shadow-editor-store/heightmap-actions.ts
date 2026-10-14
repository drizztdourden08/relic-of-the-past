/* @layer renderer-stores @kind logic */
import type { HeightmapActions, ShadowEditorGet, ShadowEditorSet } from './shadow-editor-store.type';
import { ensureScreenData } from './ensure-screen-data';
import { projectWithScreen } from './project-with-screen';
import { pushUndo } from './push-undo';

const heightmapActions = (set: ShadowEditorSet, get: ShadowEditorGet): HeightmapActions => ({
  addHeightmapElement: (screenId, element) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, heightmap: [...screenData.heightmap, element] };
    set({
      project: projectWithScreen(state.project, screenId, newScreenData),
      dirty: true,
      ...undo,
      selectedElementId: element.id,
      selectedType: 'heightmap',
    });
  },

  updateHeightmapElement: (screenId, id, patch) => {
    const state = get();
    const screenData = ensureScreenData(state.project, screenId);
    const newHeightmap = screenData.heightmap.map((el) =>
      el.id === id ? { ...el, ...patch } : el,
    );
    const newScreenData = { ...screenData, heightmap: newHeightmap };
    set({
      project: projectWithScreen(state.project, screenId, newScreenData),
      dirty: true,
    });
  },

  removeHeightmapElement: (screenId, id) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, heightmap: screenData.heightmap.filter((el) => el.id !== id) };
    set({
      project: projectWithScreen(state.project, screenId, newScreenData),
      dirty: true,
      ...undo,
      selectedElementId: null,
      selectedType: null,
    });
  },
});

export { heightmapActions };
