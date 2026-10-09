/* @layer renderer-components @kind types */
import type { MutableRefObject, RefObject } from 'react';
import type { ViewportInfo } from '@app/lib/game';
import type { HeightmapElement, LightSource, ShadowCastingProject } from '@shared/types/shadow-casting';
import type { GizmoPart } from '../../shadow-editor/gizmos';
import type { GizmoStart } from '../ShadowEditorOverlay.type';

type Vp = ViewportInfo;
type Point = { x: number; y: number };
type ElementType = 'heightmap' | 'light';
type ScreenData = { lights: LightSource[]; heightmap: HeightmapElement[] };
type Hit = { id: string; type: ElementType };
type UpdateHeightmap = (screenId: number, id: string, patch: Partial<HeightmapElement>) => void;
type UpdateLight = (screenId: number, id: string, patch: Partial<LightSource>) => void;
type AddHeightmap = (screenId: number, el: HeightmapElement) => void;
type AddLight = (screenId: number, light: LightSource) => void;
type Tool = 'select' | 'polygon' | 'shape-light' | 'point-light' | 'freehand';

interface HeightmapGizmoArgs {
  part: GizmoPart;
  el: HeightmapElement;
  screenId: number;
  worldPos: Point;
  gizmoStart: GizmoStart;
  dx: number;
  dy: number;
  update: UpdateHeightmap;
}

interface LightGizmoArgs {
  part: GizmoPart;
  light: LightSource;
  screenId: number;
  gizmoStart: GizmoStart;
  dx: number;
  dy: number;
  update: UpdateLight;
}

interface CreateShapeArgs {
  activeTool: 'polygon' | 'shape-light';
  screenId: number;
  worldPos: Point;
  dragStart: Point;
  polygonSides: number;
  polygonCornerRadius: number;
  defaultSmoothing: number;
  defaultLightIntensity: number;
  defaultLightRadius: number;
  getEffectiveHeight: () => number;
  addHeightmapElement: AddHeightmap;
  addLight: AddLight;
}

interface FinalizeFreehandArgs {
  screenId: number;
  freehandPoints: Point[];
  worldPos: Point;
  defaultSmoothing: number;
  getEffectiveHeight: () => number;
  addHeightmapElement: AddHeightmap;
}

interface HoverArgs {
  vp: Vp;
  width: number;
  height: number;
  screenData: ScreenData;
  selectedType: ElementType | null;
  selectedElementId: string | null;
  displayPos: Point;
}

interface HoverResult {
  part: GizmoPart | null;
  cursor: string;
}

interface DrawArgs {
  width: number;
  height: number;
  selectedElementId: string | null;
  freehandPoints: Point[];
  isDrawingFreehand: boolean;
  hoveredGizmo: GizmoPart | null;
  activeGizmo: GizmoPart | null;
  mouseDisplay: Point | null;
  getScreenData: (screenId: number) => ScreenData;
}

interface PointerContext {
  vp: Vp;
  pos: Point;
  world: Point;
  screenId: number;
}

interface OverlayRefs {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  vpRef: MutableRefObject<Vp | null>;
  mouseDisplayRef: MutableRefObject<Point | null>;
  hoveredGizmoRef: MutableRefObject<GizmoPart | null>;
  activeGizmoRef: MutableRefObject<GizmoPart | null>;
}

interface HandlerDeps extends OverlayRefs {
  gizmoStartRef: MutableRefObject<GizmoStart | null>;
  dragMovedRef: MutableRefObject<boolean>;
  width: number;
  height: number;
  activeTool: Tool;
  selectedElementId: string | null;
  isDragging: boolean;
  dragStartWorld: Point | null;
  isDrawingFreehand: boolean;
  freehandPoints: Point[];
  polygonSides: number;
  polygonCornerRadius: number;
  defaultSmoothing: number;
  defaultLightIntensity: number;
  defaultLightRadius: number;
  getScreenData: (screenId: number) => ScreenData;
  addHeightmapElement: AddHeightmap;
  addLight: AddLight;
  setSelectedElement: (id: string | null, type: ElementType | null) => void;
  updateHeightmapElement: UpdateHeightmap;
  updateLight: UpdateLight;
  getEffectiveHeight: () => number;
  addFreehandPoint: (p: Point) => void;
  clearFreehandPoints: () => void;
  setIsDrawingFreehand: (v: boolean) => void;
  setIsDragging: (v: boolean) => void;
  setDragStartWorld: (p: Point | null) => void;
  setCursor: (c: string) => void;
}

type InteractionDeps = Omit<HandlerDeps, 'setCursor'>;

interface OverlayKeyboardArgs {
  open: boolean;
  loadProject: (p: ShadowCastingProject) => void;
  vpRef: MutableRefObject<Vp | null>;
}

interface OverlayRenderArgs extends OverlayRefs {
  open: boolean;
  gameRunning: boolean;
  width: number;
  height: number;
  selectedElementId: string | null;
  freehandPoints: Point[];
  isDrawingFreehand: boolean;
  project: unknown;
  getScreenData: (screenId: number) => ScreenData;
}

export type {
  Vp, Point, ElementType, ScreenData, Hit, UpdateHeightmap, UpdateLight, AddHeightmap, AddLight, Tool,
  HeightmapGizmoArgs, LightGizmoArgs, CreateShapeArgs, FinalizeFreehandArgs, HoverArgs, HoverResult, DrawArgs,
  PointerContext, HandlerDeps, InteractionDeps, OverlayKeyboardArgs, OverlayRenderArgs,
};
