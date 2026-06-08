/* @layer renderer-components @kind logic */
import type { HeightmapElement, LightSource, ShapeDefinition } from '@shared/types/shadow-casting';

type Point = { x: number; y: number };
type AddHeightmap = (screenId: number, el: HeightmapElement) => void;
type AddLight = (screenId: number, light: LightSource) => void;

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

let nextId = 1;
const genId = (prefix: string): string => `${prefix}_${Date.now()}_${nextId++}`;

/** Mouse-up for polygon / shape-light tools: create a polygon shape from the drag box. */
const createShapeFromDrag = (a: CreateShapeArgs): void => {
  const w = Math.abs(a.worldPos.x - a.dragStart.x);
  const h = Math.abs(a.worldPos.y - a.dragStart.y);
  if (w < 4 && h < 4) return;
  const cx = (a.worldPos.x + a.dragStart.x) / 2;
  const cy = (a.worldPos.y + a.dragStart.y) / 2;
  const shape: ShapeDefinition = {
    id: genId('shape'), type: 'polygon', sides: a.polygonSides, cornerRadius: a.polygonCornerRadius,
    scaleX: 1, scaleY: 1, rotation: 0, x: cx, y: cy, width: w, height: h,
  };
  if (a.activeTool === 'polygon') {
    a.addHeightmapElement(a.screenId, { id: genId('hm'), shape, height: a.getEffectiveHeight(), smoothing: a.defaultSmoothing });
  } else {
    a.addLight(a.screenId, {
      id: genId('light'), type: 'shape', x: cx, y: cy, intensity: a.defaultLightIntensity,
      radius: Math.max(w, h) / 2, color: 'sample', shape, castShadows: true,
    });
  }
};

interface FinalizeFreehandArgs {
  screenId: number;
  freehandPoints: Point[];
  worldPos: Point;
  defaultSmoothing: number;
  getEffectiveHeight: () => number;
  addHeightmapElement: AddHeightmap;
}

/** Double-click: close the freehand polygon and add it as a heightmap element. */
const finalizeFreehand = (a: FinalizeFreehandArgs): void => {
  const allPoints = [...a.freehandPoints, a.worldPos];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of allPoints) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  const shape: ShapeDefinition = {
    id: genId('shape'), type: 'freehand',
    x: (minX + maxX) / 2, y: (minY + maxY) / 2,
    width: maxX - minX, height: maxY - minY, points: allPoints,
  };
  a.addHeightmapElement(a.screenId, { id: genId('hm'), shape, height: a.getEffectiveHeight(), smoothing: a.defaultSmoothing });
};

export type { Point, AddHeightmap, AddLight };
export { genId, createShapeFromDrag, finalizeFreehand };
