/* @layer renderer-stores @kind logic */
import type { ScreenEditActions, ShadowEditorGet, ShadowEditorSet } from './shadow-editor-store.type';
import { ensureScreenData } from './ensureScreenData';
import { pushUndo } from './pushUndo';

const screenEditActions = (set: ShadowEditorSet, get: ShadowEditorGet): ScreenEditActions => ({
  addHeightmapElement: (screenId, element) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, heightmap: [...screenData.heightmap, element] };
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: newScreenData } },
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
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: newScreenData } },
      dirty: true,
    });
  },

  removeHeightmapElement: (screenId, id) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, heightmap: screenData.heightmap.filter((el) => el.id !== id) };
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: newScreenData } },
      dirty: true,
      ...undo,
      selectedElementId: null,
      selectedType: null,
    });
  },

  addLight: (screenId, light) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, lights: [...screenData.lights, light] };
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: newScreenData } },
      dirty: true,
      ...undo,
      selectedElementId: light.id,
      selectedType: 'light',
    });
  },

  updateLight: (screenId, id, patch) => {
    const state = get();
    const screenData = ensureScreenData(state.project, screenId);
    const newLights = screenData.lights.map((l) => (l.id === id ? { ...l, ...patch } : l));
    const newScreenData = { ...screenData, lights: newLights };
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: newScreenData } },
      dirty: true,
    });
  },

  removeLight: (screenId, id) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, lights: screenData.lights.filter((l) => l.id !== id) };
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: newScreenData } },
      dirty: true,
      ...undo,
      selectedElementId: null,
      selectedType: null,
    });
  },

  updateLighting: (screenId, patch) => {
    const state = get();
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, lighting: { ...screenData.lighting, ...patch } };
    set({
      project: { ...state.project, screens: { ...state.project.screens, [screenId]: newScreenData } },
      dirty: true,
    });
  },
});

export { screenEditActions };
