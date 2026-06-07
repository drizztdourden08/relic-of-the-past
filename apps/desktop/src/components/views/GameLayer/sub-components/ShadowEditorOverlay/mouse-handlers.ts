/* @layer renderer-components @kind logic */
import type { MouseEvent } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import type { HeightmapElement, LightSource } from '@shared/types/shadow-casting';
import { screenIdFromVp, displayToWorld, getCanvasPos } from './coords';
import type { Vp, Point } from './coords';
import { hitTest } from './hittest';
import type { ScreenData } from './hittest';
import { genId, createShapeFromDrag, finalizeFreehand } from './shapes';
import { applyHeightmapGizmo, applyLightGizmo } from './gizmo-drag';
import { detectHover } from './hover';
import type { GizmoStart } from './types';
import type { GizmoPart } from '../shadow-editor/gizmos';

type Tool = 'select' | 'polygon' | 'shape-light' | 'point-light' | 'freehand';

interface HandlerDeps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  vpRef: MutableRefObject<Vp | null>;
  mouseDisplayRef: MutableRefObject<Point | null>;
  hoveredGizmoRef: MutableRefObject<GizmoPart | null>;
  activeGizmoRef: MutableRefObject<GizmoPart | null>;
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
  addHeightmapElement: (screenId: number, el: HeightmapElement) => void;
  addLight: (screenId: number, light: LightSource) => void;
  setSelectedElement: (id: string | null, type: 'heightmap' | 'light' | null) => void;
  updateHeightmapElement: (screenId: number, id: string, patch: Partial<HeightmapElement>) => void;
  updateLight: (screenId: number, id: string, patch: Partial<LightSource>) => void;
  getEffectiveHeight: () => number;
  addFreehandPoint: (p: Point) => void;
  clearFreehandPoints: () => void;
  setIsDrawingFreehand: (v: boolean) => void;
  setIsDragging: (v: boolean) => void;
  setDragStartWorld: (p: Point | null) => void;
  setCursor: (c: string) => void;
}

const snapshot = (sd: ScreenData, type: 'heightmap' | 'light', id: string): GizmoStart | null => {
  if (type === 'heightmap') {
    const el = sd.heightmap.find((h) => h.id === id);
    return el ? { x: el.shape.x, y: el.shape.y, width: el.shape.width, height: el.shape.height, rotation: el.shape.rotation ?? 0 } : null;
  }
  const light = sd.lights.find((l) => l.id === id);
  return light ? { x: light.x, y: light.y, width: 0, height: 0, rotation: 0 } : null;
};

const createMouseHandlers = (d: HandlerDeps) => {
  const ctx = (e: MouseEvent): { vp: Vp; pos: Point; world: Point; screenId: number } | null => {
    const canvas = d.canvasRef.current, vp = d.vpRef.current;
    if (!canvas || !vp) return null;
    const pos = getCanvasPos(e.clientX, e.clientY, canvas);
    return { vp, pos, world: displayToWorld(vp, d.width, d.height, pos.x, pos.y), screenId: screenIdFromVp(vp) };
  };

  const handleMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    const c = ctx(e);
    if (!c) return;
    const store = useShadowEditorStore.getState();
    if (d.activeTool === 'select') {
      if (d.selectedElementId && d.hoveredGizmoRef.current) {
        d.activeGizmoRef.current = d.hoveredGizmoRef.current;
        d.dragMovedRef.current = false;
        d.setIsDragging(true);
        d.setDragStartWorld(c.world);
        if (store.selectedType) d.gizmoStartRef.current = snapshot(d.getScreenData(c.screenId), store.selectedType, d.selectedElementId);
        return;
      }
      const hit = hitTest(d.getScreenData(c.screenId), c.world.x, c.world.y);
      if (hit) {
        d.setSelectedElement(hit.id, hit.type);
        d.setIsDragging(true);
        d.setDragStartWorld(c.world);
        d.dragMovedRef.current = false;
        d.gizmoStartRef.current = snapshot(d.getScreenData(c.screenId), hit.type, hit.id);
      } else {
        d.setSelectedElement(null, null);
      }
      return;
    }
    if (d.activeTool === 'polygon' || d.activeTool === 'shape-light') { d.setIsDragging(true); d.setDragStartWorld(c.world); return; }
    if (d.activeTool === 'point-light') {
      d.addLight(c.screenId, { id: genId('light'), type: 'point', x: c.world.x, y: c.world.y, intensity: d.defaultLightIntensity, radius: d.defaultLightRadius, color: 'sample', castShadows: true });
      return;
    }
    if (d.activeTool === 'freehand') {
      if (!d.isDrawingFreehand) { d.setIsDrawingFreehand(true); d.clearFreehandPoints(); }
      d.addFreehandPoint(c.world);
    }
  };

  const handleMouseUp = (e: MouseEvent): void => {
    if (!d.isDragging && d.activeTool !== 'freehand') return;
    const c = ctx(e);
    if (!c) { d.setIsDragging(false); return; }
    if (d.activeTool === 'select' && d.isDragging && d.selectedElementId && d.dragStartWorld) {
      d.activeGizmoRef.current = null; d.gizmoStartRef.current = null; d.setIsDragging(false); d.setDragStartWorld(null); return;
    }
    if ((d.activeTool === 'polygon' || d.activeTool === 'shape-light') && d.isDragging && d.dragStartWorld) {
      createShapeFromDrag({ activeTool: d.activeTool, screenId: c.screenId, worldPos: c.world, dragStart: d.dragStartWorld, polygonSides: d.polygonSides, polygonCornerRadius: d.polygonCornerRadius, defaultSmoothing: d.defaultSmoothing, defaultLightIntensity: d.defaultLightIntensity, defaultLightRadius: d.defaultLightRadius, getEffectiveHeight: d.getEffectiveHeight, addHeightmapElement: d.addHeightmapElement, addLight: d.addLight });
    }
    d.setIsDragging(false); d.setDragStartWorld(null);
  };

  const handleMouseMove = (e: MouseEvent): void => {
    const canvas = d.canvasRef.current, vp = d.vpRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e.clientX, e.clientY, canvas);
    d.mouseDisplayRef.current = pos;
    const world = vp ? displayToWorld(vp, d.width, d.height, pos.x, pos.y) : null;
    const store = useShadowEditorStore.getState();

    if (d.activeGizmoRef.current && d.isDragging && d.dragStartWorld && world && d.selectedElementId && vp) {
      const screenId = screenIdFromVp(vp), sd = d.getScreenData(screenId), gizmoStart = d.gizmoStartRef.current;
      if (!gizmoStart) return;
      const dx = world.x - d.dragStartWorld.x, dy = world.y - d.dragStartWorld.y;
      if (!d.dragMovedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) d.dragMovedRef.current = true;
      if (!d.dragMovedRef.current) return;
      if (store.selectedType === 'heightmap') {
        const el = sd.heightmap.find((h) => h.id === d.selectedElementId);
        if (el) applyHeightmapGizmo({ part: d.activeGizmoRef.current, el, screenId, worldPos: world, gizmoStart, dx, dy, update: d.updateHeightmapElement });
      } else if (store.selectedType === 'light') {
        const light = sd.lights.find((l) => l.id === d.selectedElementId);
        if (light) applyLightGizmo({ part: d.activeGizmoRef.current, light, screenId, gizmoStart, dx, dy, update: d.updateLight });
      }
      return;
    }

    if (d.activeTool === 'select' && d.isDragging && d.dragStartWorld && world && d.selectedElementId && !d.activeGizmoRef.current && vp) {
      const screenId = screenIdFromVp(vp), gizmoStart = d.gizmoStartRef.current;
      if (!gizmoStart) return;
      const dx = world.x - d.dragStartWorld.x, dy = world.y - d.dragStartWorld.y;
      if (store.selectedType === 'heightmap') {
        const el = store.getScreenData(screenId).heightmap.find((h) => h.id === d.selectedElementId);
        if (el) d.updateHeightmapElement(screenId, d.selectedElementId, { shape: { ...el.shape, x: gizmoStart.x + dx, y: gizmoStart.y + dy } });
      } else if (store.selectedType === 'light') {
        d.updateLight(screenId, d.selectedElementId, { x: gizmoStart.x + dx, y: gizmoStart.y + dy });
      }
      return;
    }

    if ((d.activeTool === 'polygon' || d.activeTool === 'shape-light') && d.isDragging) return;

    if (d.activeTool === 'select' && d.selectedElementId && !d.isDragging && vp) {
      const sd = d.getScreenData(screenIdFromVp(vp));
      const { part, cursor } = detectHover({ vp, width: d.width, height: d.height, screenData: sd, selectedType: store.selectedType, selectedElementId: d.selectedElementId, displayPos: pos });
      d.hoveredGizmoRef.current = part;
      d.setCursor(cursor);
    } else if (d.activeTool !== 'select') {
      d.hoveredGizmoRef.current = null;
      d.setCursor('crosshair');
    }
  };

  const handleDoubleClick = (e: MouseEvent): void => {
    if (d.activeTool !== 'freehand' || !d.isDrawingFreehand || d.freehandPoints.length < 3) return;
    const c = ctx(e);
    if (!c) return;
    finalizeFreehand({ screenId: c.screenId, freehandPoints: d.freehandPoints, worldPos: c.world, defaultSmoothing: d.defaultSmoothing, getEffectiveHeight: d.getEffectiveHeight, addHeightmapElement: d.addHeightmapElement });
    d.clearFreehandPoints();
    d.setIsDrawingFreehand(false);
  };

  const handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    const store = useShadowEditorStore.getState();
    const vp = d.vpRef.current;
    if (d.isDragging || d.activeGizmoRef.current) {
      const screenId = vp ? screenIdFromVp(vp) : -1;
      const gizmoStart = d.gizmoStartRef.current;
      if (gizmoStart && d.selectedElementId && screenId >= 0) {
        if (store.selectedType === 'heightmap') {
          const el = store.getScreenData(screenId).heightmap.find((h) => h.id === d.selectedElementId);
          if (el) d.updateHeightmapElement(screenId, d.selectedElementId, { shape: { ...el.shape, x: gizmoStart.x, y: gizmoStart.y, width: gizmoStart.width, height: gizmoStart.height, rotation: gizmoStart.rotation } });
        } else if (store.selectedType === 'light') {
          d.updateLight(screenId, d.selectedElementId, { x: gizmoStart.x, y: gizmoStart.y });
        }
      }
      d.activeGizmoRef.current = null; d.gizmoStartRef.current = null; d.setIsDragging(false); d.setDragStartWorld(null);
      return;
    }
    if (d.isDrawingFreehand) { d.clearFreehandPoints(); d.setIsDrawingFreehand(false); }
  };

  return { handleMouseDown, handleMouseUp, handleMouseMove, handleDoubleClick, handleContextMenu };
};

export type { HandlerDeps, Tool };
export { createMouseHandlers };
