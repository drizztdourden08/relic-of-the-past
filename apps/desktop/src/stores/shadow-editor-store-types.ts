/* @layer renderer-stores @kind types */
import type {
  ShadowCastingProject,
  ScreenShadowData,
  HeightmapElement,
  LightSource,
  ScreenLightingConfig,
} from '@shared/types/shadow-casting';

type EditorTool = 'select' | 'polygon' | 'freehand' | 'point-light' | 'shape-light';
type HeightPreset = '0.25' | '0.5' | '0.75' | '1.0' | 'custom';

interface ShadowEditorStore {
  // ─── Visibility ───
  open: boolean;
  setOpen: (open: boolean) => void;
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;

  // ─── Project data ───
  project: ShadowCastingProject;
  dirty: boolean;

  // ─── Tool state ───
  activeTool: EditorTool;
  selectedElementId: string | null;
  selectedType: 'heightmap' | 'light' | null;

  // ─── Tool parameters ───
  polygonSides: number;
  polygonCornerRadius: number;
  heightPreset: HeightPreset;
  customHeight: number;
  defaultSmoothing: number;
  defaultLightIntensity: number;
  defaultLightRadius: number;
  heightLevels: { label: string; value: number }[];

  // ─── Freehand state ───
  freehandPoints: { x: number; y: number }[];
  isDrawingFreehand: boolean;

  // ─── Drag state ───
  isDragging: boolean;
  dragStartWorld: { x: number; y: number } | null;

  // ─── Undo/Redo ───
  undoStack: ScreenShadowData[];
  redoStack: ScreenShadowData[];

  // ─── Actions ───
  loadProject: (project: ShadowCastingProject) => void;
  setActiveTool: (tool: EditorTool) => void;
  setSelectedElement: (id: string | null, type: 'heightmap' | 'light' | null) => void;

  // Height
  setHeightPreset: (preset: HeightPreset) => void;
  setCustomHeight: (height: number) => void;
  getEffectiveHeight: () => number;

  // Tool params
  setPolygonSides: (sides: number) => void;
  setPolygonCornerRadius: (radius: number) => void;
  setDefaultSmoothing: (smoothing: number) => void;
  setDefaultLightIntensity: (intensity: number) => void;
  setDefaultLightRadius: (radius: number) => void;
  addHeightLevel: (label: string, value: number) => void;
  removeHeightLevel: (index: number) => void;
  updateHeightLevel: (index: number, patch: { label?: string; value?: number }) => void;

  // Screen data mutations
  addHeightmapElement: (screenId: number, element: HeightmapElement) => void;
  updateHeightmapElement: (screenId: number, id: string, patch: Partial<HeightmapElement>) => void;
  removeHeightmapElement: (screenId: number, id: string) => void;
  addLight: (screenId: number, light: LightSource) => void;
  updateLight: (screenId: number, id: string, patch: Partial<LightSource>) => void;
  removeLight: (screenId: number, id: string) => void;
  updateLighting: (screenId: number, patch: Partial<ScreenLightingConfig>) => void;

  // Freehand
  addFreehandPoint: (point: { x: number; y: number }) => void;
  clearFreehandPoints: () => void;
  setIsDrawingFreehand: (drawing: boolean) => void;

  // Drag
  setIsDragging: (dragging: boolean) => void;
  setDragStartWorld: (pos: { x: number; y: number } | null) => void;

  // Undo/Redo
  undo: (screenId: number) => void;
  redo: (screenId: number) => void;

  // Persistence
  markClean: () => void;
  save: () => Promise<void>;

  // Helpers
  getScreenData: (screenId: number) => ScreenShadowData;
}

export type { EditorTool, HeightPreset, ShadowEditorStore };
