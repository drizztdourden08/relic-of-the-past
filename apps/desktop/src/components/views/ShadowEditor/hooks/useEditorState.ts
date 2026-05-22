import { create } from 'zustand';
import type {
  ShadowCastingProject,
  ScreenShadowData,
  HeightmapElement,
  LightSource,
  ScreenLightingConfig,
  ShapeDefinition,
} from '@shared/types/shadow-casting';
import { DEFAULT_LIGHTING_CONFIG, EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';

type EditorTool = 'select' | 'polygon' | 'freehand' | 'point-light' | 'shape-light';

interface EditorState {
  // ─── Project data ───
  project: ShadowCastingProject;
  currentScreenId: number;
  dirty: boolean;

  // ─── Tool state ───
  activeTool: EditorTool;
  selectedElementId: string | null;
  selectedType: 'heightmap' | 'light' | null;

  // ─── Tool parameters (for creating new shapes) ───
  polygonSides: number;
  polygonCornerRadius: number;
  defaultHeight: number;
  defaultSmoothing: number;
  defaultLightIntensity: number;
  defaultLightRadius: number;

  // ─── Freehand drawing state ───
  freehandPoints: { x: number; y: number }[];
  isDrawingFreehand: boolean;

  // ─── Undo/Redo ───
  undoStack: ScreenShadowData[];
  redoStack: ScreenShadowData[];

  // ─── Actions ───
  loadProject: (project: ShadowCastingProject) => void;
  setCurrentScreen: (screenId: number) => void;
  setActiveTool: (tool: EditorTool) => void;
  setSelectedElement: (id: string | null, type: 'heightmap' | 'light' | null) => void;

  // Shape creation
  addHeightmapElement: (element: HeightmapElement) => void;
  updateHeightmapElement: (id: string, patch: Partial<HeightmapElement>) => void;
  removeHeightmapElement: (id: string) => void;

  // Light creation
  addLight: (light: LightSource) => void;
  updateLight: (id: string, patch: Partial<LightSource>) => void;
  removeLight: (id: string) => void;

  // Lighting config
  updateLighting: (patch: Partial<ScreenLightingConfig>) => void;

  // Tool params
  setPolygonSides: (sides: number) => void;
  setPolygonCornerRadius: (radius: number) => void;
  setDefaultHeight: (height: number) => void;
  setDefaultSmoothing: (smoothing: number) => void;
  setDefaultLightIntensity: (intensity: number) => void;
  setDefaultLightRadius: (radius: number) => void;

  // Freehand
  addFreehandPoint: (point: { x: number; y: number }) => void;
  clearFreehandPoints: () => void;
  setIsDrawingFreehand: (drawing: boolean) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Persistence
  markClean: () => void;

  // Helpers
  getCurrentScreenData: () => ScreenShadowData;
}

function ensureScreenData(project: ShadowCastingProject, screenId: number): ScreenShadowData {
  if (project.screens[screenId]) return project.screens[screenId];
  return {
    screenId,
    heightmap: [],
    lights: [],
    lighting: { ...project.globalDefaults },
  };
}

const useEditorState = create<EditorState>((set, get) => ({
  project: { ...EMPTY_SHADOW_PROJECT },
  currentScreenId: 0,
  dirty: false,
  activeTool: 'select',
  selectedElementId: null,
  selectedType: null,
  polygonSides: 4,
  polygonCornerRadius: 0,
  defaultHeight: 0.5,
  defaultSmoothing: 4,
  defaultLightIntensity: 0.8,
  defaultLightRadius: 64,
  freehandPoints: [],
  isDrawingFreehand: false,
  undoStack: [],
  redoStack: [],

  loadProject: (project) => set({ project, dirty: false, undoStack: [], redoStack: [] }),

  setCurrentScreen: (screenId) => set({ currentScreenId: screenId, selectedElementId: null, selectedType: null }),

  setActiveTool: (tool) => set({ activeTool: tool, selectedElementId: null, selectedType: null, freehandPoints: [], isDrawingFreehand: false }),

  setSelectedElement: (id, type) => set({ selectedElementId: id, selectedType: type }),

  addHeightmapElement: (element) => {
    const state = get();
    const screenData = ensureScreenData(state.project, state.currentScreenId);
    const newScreenData = { ...screenData, heightmap: [...screenData.heightmap, element] };
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: newScreenData },
    };
    set({
      project: newProject,
      dirty: true,
      undoStack: [...state.undoStack, screenData],
      redoStack: [],
      selectedElementId: element.id,
      selectedType: 'heightmap',
    });
  },

  updateHeightmapElement: (id, patch) => {
    const state = get();
    const screenData = ensureScreenData(state.project, state.currentScreenId);
    const newHeightmap = screenData.heightmap.map((el) =>
      el.id === id ? { ...el, ...patch, shape: patch.shape ? { ...el.shape, ...patch.shape } : el.shape } : el,
    );
    const newScreenData = { ...screenData, heightmap: newHeightmap };
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: newScreenData },
    };
    set({ project: newProject, dirty: true });
  },

  removeHeightmapElement: (id) => {
    const state = get();
    const screenData = ensureScreenData(state.project, state.currentScreenId);
    const newScreenData = { ...screenData, heightmap: screenData.heightmap.filter((el) => el.id !== id) };
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: newScreenData },
    };
    set({
      project: newProject,
      dirty: true,
      undoStack: [...state.undoStack, screenData],
      redoStack: [],
      selectedElementId: null,
      selectedType: null,
    });
  },

  addLight: (light) => {
    const state = get();
    const screenData = ensureScreenData(state.project, state.currentScreenId);
    const newScreenData = { ...screenData, lights: [...screenData.lights, light] };
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: newScreenData },
    };
    set({
      project: newProject,
      dirty: true,
      undoStack: [...state.undoStack, screenData],
      redoStack: [],
      selectedElementId: light.id,
      selectedType: 'light',
    });
  },

  updateLight: (id, patch) => {
    const state = get();
    const screenData = ensureScreenData(state.project, state.currentScreenId);
    const newLights = screenData.lights.map((l) => (l.id === id ? { ...l, ...patch } : l));
    const newScreenData = { ...screenData, lights: newLights };
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: newScreenData },
    };
    set({ project: newProject, dirty: true });
  },

  removeLight: (id) => {
    const state = get();
    const screenData = ensureScreenData(state.project, state.currentScreenId);
    const newScreenData = { ...screenData, lights: screenData.lights.filter((l) => l.id !== id) };
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: newScreenData },
    };
    set({
      project: newProject,
      dirty: true,
      undoStack: [...state.undoStack, screenData],
      redoStack: [],
      selectedElementId: null,
      selectedType: null,
    });
  },

  updateLighting: (patch) => {
    const state = get();
    const screenData = ensureScreenData(state.project, state.currentScreenId);
    const newScreenData = { ...screenData, lighting: { ...screenData.lighting, ...patch } };
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: newScreenData },
    };
    set({ project: newProject, dirty: true });
  },

  setPolygonSides: (sides) => set({ polygonSides: sides }),
  setPolygonCornerRadius: (radius) => set({ polygonCornerRadius: radius }),
  setDefaultHeight: (height) => set({ defaultHeight: height }),
  setDefaultSmoothing: (smoothing) => set({ defaultSmoothing: smoothing }),
  setDefaultLightIntensity: (intensity) => set({ defaultLightIntensity: intensity }),
  setDefaultLightRadius: (radius) => set({ defaultLightRadius: radius }),

  addFreehandPoint: (point) => set((s) => ({ freehandPoints: [...s.freehandPoints, point] })),
  clearFreehandPoints: () => set({ freehandPoints: [] }),
  setIsDrawingFreehand: (drawing) => set({ isDrawingFreehand: drawing }),

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    const currentScreenData = ensureScreenData(state.project, state.currentScreenId);
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: prev },
    };
    set({
      project: newProject,
      dirty: true,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentScreenData],
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    const currentScreenData = ensureScreenData(state.project, state.currentScreenId);
    const newProject = {
      ...state.project,
      screens: { ...state.project.screens, [state.currentScreenId]: next },
    };
    set({
      project: newProject,
      dirty: true,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, currentScreenData],
    });
  },

  markClean: () => set({ dirty: false }),

  getCurrentScreenData: () => {
    const state = get();
    return ensureScreenData(state.project, state.currentScreenId);
  },
}));

export { useEditorState };
export type { EditorTool };
