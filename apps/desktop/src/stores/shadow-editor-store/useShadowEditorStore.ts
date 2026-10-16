/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { EMPTY_SHADOW_PROJECT } from '@rotp/game-core';
import type { ShadowEditorStore } from './shadow-editor-store.type';
import { ensureScreenData } from './ensure-screen-data';
import { screenEditActions } from './screen-edit-actions';
import { heightLevelActions } from './height-level-actions';
import { historyActions } from './history-actions';
import { saveAction } from './save-action';
import { DEFAULT_HEIGHT_LEVELS } from './shadow-editor-store.constants';

const useShadowEditorStore = create<ShadowEditorStore>((set, get) => ({
  previewMode: false,
  setPreviewMode: (previewMode) => set({ previewMode }),
  debugMode: false,
  setDebugMode: (debugMode) => set({ debugMode }),

  project: { ...EMPTY_SHADOW_PROJECT },
  loaded: false,
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
  heightLevels: DEFAULT_HEIGHT_LEVELS.map((level) => ({ ...level })),
  freehandPoints: [],
  isDrawingFreehand: false,
  isDragging: false,
  dragStartWorld: null,
  undoStack: [],
  redoStack: [],

  loadProject: (project) => set({ project, loaded: true, dirty: false, undoStack: [], redoStack: [] }),

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

  ...heightLevelActions(set),

  ...screenEditActions(set, get),

  addFreehandPoint: (point) => set((s) => ({ freehandPoints: [...s.freehandPoints, point] })),
  clearFreehandPoints: () => set({ freehandPoints: [] }),
  setIsDrawingFreehand: (drawing) => set({ isDrawingFreehand: drawing }),

  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setDragStartWorld: (pos) => set({ dragStartWorld: pos }),

  ...historyActions(set, get),

  markClean: () => set({ dirty: false }),

  ...saveAction(set, get),

  getScreenData: (screenId) => ensureScreenData(get().project, screenId),
}));

export { useShadowEditorStore };
