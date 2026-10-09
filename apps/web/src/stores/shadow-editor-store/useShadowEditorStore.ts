/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';
import type { ShadowEditorStore } from './shadow-editor-store.type';
import { ensureScreenData } from './ensure-screen-data';
import { screenEditActions } from './screen-edit-actions';
import { historyActions } from './history-actions';

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

  ...screenEditActions(set, get),

  addFreehandPoint: (point) => set((s) => ({ freehandPoints: [...s.freehandPoints, point] })),
  clearFreehandPoints: () => set({ freehandPoints: [] }),
  setIsDrawingFreehand: (drawing) => set({ isDrawingFreehand: drawing }),

  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setDragStartWorld: (pos) => set({ dragStartWorld: pos }),

  ...historyActions(set, get),

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
