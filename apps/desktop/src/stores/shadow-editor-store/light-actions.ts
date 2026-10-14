/* @layer renderer-stores @kind logic */
import type { LightActions, ShadowEditorGet, ShadowEditorSet } from './shadow-editor-store.type';
import { ensureScreenData } from './ensure-screen-data';
import { projectWithScreen } from './project-with-screen';
import { pushUndo } from './push-undo';

const lightActions = (set: ShadowEditorSet, get: ShadowEditorGet): LightActions => ({
  addLight: (screenId, light) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, lights: [...screenData.lights, light] };
    set({
      project: projectWithScreen(state.project, screenId, newScreenData),
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
      project: projectWithScreen(state.project, screenId, newScreenData),
      dirty: true,
    });
  },

  removeLight: (screenId, id) => {
    const state = get();
    const undo = pushUndo(state, screenId);
    const screenData = ensureScreenData(state.project, screenId);
    const newScreenData = { ...screenData, lights: screenData.lights.filter((l) => l.id !== id) };
    set({
      project: projectWithScreen(state.project, screenId, newScreenData),
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
      project: projectWithScreen(state.project, screenId, newScreenData),
      dirty: true,
    });
  },
});

export { lightActions };
