/* @layer renderer-stores @kind types */
import type { StoreApi } from 'zustand';
import type { ShadowCastingProject, ScreenShadowData, HeightmapElement, LightSource, ScreenLightingConfig } from '@rotp/game-core';

type EditorTool = 'select' | 'polygon' | 'freehand' | 'point-light' | 'shape-light';
type HeightPreset = '0.25' | '0.5' | '0.75' | '1.0' | 'custom';

interface ShadowEditorStore {
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;

  project: ShadowCastingProject;
  loaded: boolean;
  dirty: boolean;

  activeTool: EditorTool;
  selectedElementId: string | null;
  selectedType: 'heightmap' | 'light' | null;

  polygonSides: number;
  polygonCornerRadius: number;
  heightPreset: HeightPreset;
  customHeight: number;
  defaultSmoothing: number;
  defaultLightIntensity: number;
  defaultLightRadius: number;
  heightLevels: { label: string; value: number }[];

  freehandPoints: { x: number; y: number }[];
  isDrawingFreehand: boolean;

  isDragging: boolean;
  dragStartWorld: { x: number; y: number } | null;

  undoStack: ScreenShadowData[];
  redoStack: ScreenShadowData[];

  loadProject: (project: ShadowCastingProject) => void;
  setActiveTool: (tool: EditorTool) => void;
  setSelectedElement: (id: string | null, type: 'heightmap' | 'light' | null) => void;

  setHeightPreset: (preset: HeightPreset) => void;
  setCustomHeight: (height: number) => void;
  getEffectiveHeight: () => number;

  setPolygonSides: (sides: number) => void;
  setPolygonCornerRadius: (radius: number) => void;
  setDefaultSmoothing: (smoothing: number) => void;
  setDefaultLightIntensity: (intensity: number) => void;
  setDefaultLightRadius: (radius: number) => void;
  addHeightLevel: (label: string, value: number) => void;
  removeHeightLevel: (index: number) => void;
  updateHeightLevel: (index: number, patch: { label?: string; value?: number }) => void;

  addHeightmapElement: (screenId: number, element: HeightmapElement) => void;
  updateHeightmapElement: (screenId: number, id: string, patch: Partial<HeightmapElement>) => void;
  removeHeightmapElement: (screenId: number, id: string) => void;
  addLight: (screenId: number, light: LightSource) => void;
  updateLight: (screenId: number, id: string, patch: Partial<LightSource>) => void;
  removeLight: (screenId: number, id: string) => void;
  updateLighting: (screenId: number, patch: Partial<ScreenLightingConfig>) => void;

  addFreehandPoint: (point: { x: number; y: number }) => void;
  clearFreehandPoints: () => void;
  setIsDrawingFreehand: (drawing: boolean) => void;

  setIsDragging: (dragging: boolean) => void;
  setDragStartWorld: (pos: { x: number; y: number } | null) => void;

  undo: (screenId: number) => void;
  redo: (screenId: number) => void;

  markClean: () => void;
  save: () => Promise<void>;

  getScreenData: (screenId: number) => ScreenShadowData;
}

type ShadowEditorSet = StoreApi<ShadowEditorStore>['setState'];
type ShadowEditorGet = StoreApi<ShadowEditorStore>['getState'];

type HeightmapActions = Pick<ShadowEditorStore,
  'addHeightmapElement' | 'updateHeightmapElement' | 'removeHeightmapElement'>;

type LightActions = Pick<ShadowEditorStore, 'addLight' | 'updateLight' | 'removeLight' | 'updateLighting'>;

type ScreenEditActions = HeightmapActions & LightActions;

type HeightLevelActions = Pick<ShadowEditorStore, 'addHeightLevel' | 'removeHeightLevel' | 'updateHeightLevel'>;

type SaveAction = Pick<ShadowEditorStore, 'save'>;

type HistoryActions = Pick<ShadowEditorStore, 'undo' | 'redo'>;

type UndoPatch = { undoStack: ScreenShadowData[]; redoStack: ScreenShadowData[] };

export type {
  EditorTool,
  HeightLevelActions,
  HeightmapActions,
  HistoryActions,
  LightActions,
  SaveAction,
  ScreenEditActions,
  ShadowEditorGet,
  ShadowEditorSet,
  ShadowEditorStore,
  UndoPatch,
};
