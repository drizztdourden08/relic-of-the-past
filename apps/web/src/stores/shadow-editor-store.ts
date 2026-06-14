/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { ShadowCastingProject, ScreenShadowData } from '@shared/types/shadow-casting';
import { EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';
import type { ShadowEditorStore } from './shadow-editor-store-types';

const ensureScreenData = (project: ShadowCastingProject, screenId: number): ScreenShadowData => {
  if (project.screens[screenId]) return project.screens[screenId];
  return {
    screenId,
    heightmap: [],
    lights: [],
    lighting: { ...project.globalDefaults },
  };
};

const pushUndo = (state: ShadowEditorStore, screenId: number): { undoStack: ScreenShadowData[]; redoStack: ScreenShadowData[] } => {
  const current = ensureScreenData(state.project, screenId);
  return {
    undoStack: [...state.undoStack.slice(-20), current],
    redoStack: [],
  };
};

const useShadowEditorStore = create<ShadowEditorStore>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  previewMode: false,
  setPreviewMode: (previewMode) => set({ previewMode }),
  debugMode: false,
  setDebugMode: (debugMode) => set({ debugMode }),

  project: { ...EMPTY_SHADOW_PROJECT },
  dirty: false,
  activeTool: 'select',
  selectedElementId: null,
  selectedType: null,
  polygonSides: 4,
  polygonCornerRadius: 0,
  heightPreset: '0.5',
  customHeight: 0.5,
  defaultSmoothing: 2,
  defaultLightIntensity: 0.8,
  defaultLightRadius: 64,
  heightLevels: [
    { label: 'Low', value: 0.25 },
    { label: 'Mid', value: 0.5 },
    { label: 'High', value: 0.75 },
    { label: 'Wall', value: 1.0 },
  ],
  freehandPoints: [],
  isDrawingFreehand: false,
  isDragging: false,
  dragStartWorld: null,
  undoStack: [],
  redoStack: [],

  loadProject: (project) => set({ project, dirty: false, undoStack: [], redoStack: [] }),

  setActiveTool: (tool) => set({ activeTool: tool, selectedElementId: null, selectedType: null, freehandPoints: [], isDrawingFreehand: false }),

  setSelectedElement: (id, type) => set({ selectedElementId: id, selectedType: type }),

  setHeightPreset: (preset) => set({ heightPreset: preset }),
  setCustomHeight: (height) => set({ customHeight: height, heightPreset: 'custom' }),
  getEffectiveHeight: () => {
    const s = get();
    if (s.heightPreset === 'custom') return s.customHeight;
    return parseFloat(s.heightPreset);
  },

  setPolygonSides: (sides) => set({ polygonSides: sides }),
  setPolygonCornerRadius: (radius) => set({ polygonCornerRadius: radius }),
  setDefaultSmoothing: (smoothing) => set({ defaultSmoothing: smoothing }),
  setDefaultLightIntensity: (intensity) => set({ defaultLightIntensity: intensity }),
  setDefaultLightRadius: (radius) => set({ defaultLightRadius: radius }),

  addHeightLevel: (label, value) => set((s) => ({ heightLevels: [...s.heightLevels, { label, value }] })),
  removeHeightLevel: (index) => set((s) => ({ heightLevels: s.heightLevels.filter((_, i) => i !== index) })),
  updateHeightLevel: (index, patch) => set((s) => ({
    heightLevels: s.heightLevels.map((l, i) => i === index ? { ...l, ...patch } : l),
  })),

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

  addFreehandPoint: (point) => set((s) => ({ freehandPoints: [...s.freehandPoints, point] })),
  clearFreehandPoints: () => set({ freehandPoints: [] }),
  setIsDrawingFreehand: (drawing) => set({ isDrawingFreehand: drawing }),

  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setDragStartWorld: (pos) => set({ dragStartWorld: pos }),

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

  markClean: () => set({ dirty: false }),

  save: async () => {
    const state = get();
    if (!state.dirty) return;
    try {
      await window.api.shadowCasting.save(state.project);
      set({ dirty: false });
    } catch (err) {
      console.error('[ShadowEditor] Save failed:', err);
    }
  },

  getScreenData: (screenId) => ensureScreenData(get().project, screenId),
}));

export { useShadowEditorStore };
export type { EditorTool, HeightPreset } from './shadow-editor-store-types';
