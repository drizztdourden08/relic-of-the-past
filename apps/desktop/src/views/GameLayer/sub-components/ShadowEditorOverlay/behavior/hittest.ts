/* @layer renderer-components @kind logic */
import type { HeightmapElement } from '@rotp/game-core';
import { FREEHAND_EDGE_HIT_DISTANCE, LIGHT_HIT_RADIUS, SHAPE_HIT_PADDING } from './overlay.constants';
import type { Hit, Point, ScreenData } from './overlay.type';

const insidePolygon = (pts: Point[], worldX: number, worldY: number): boolean => {
  let inside = false;
  for (let j = 0, k = pts.length - 1; j < pts.length; k = j++) {
    const xi = pts[j].x, yi = pts[j].y;
    const xk = pts[k].x, yk = pts[k].y;
    if (((yi > worldY) !== (yk > worldY)) && (worldX < (xk - xi) * (worldY - yi) / (yk - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
};

const nearPolygonEdge = (pts: Point[], worldX: number, worldY: number): boolean => {
  for (let j = 0, k = pts.length - 1; j < pts.length; k = j++) {
    const dx = pts[j].x - pts[k].x, dy = pts[j].y - pts[k].y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    let t = ((worldX - pts[k].x) * dx + (worldY - pts[k].y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = pts[k].x + t * dx, cy = pts[k].y + t * dy;
    if (Math.sqrt((worldX - cx) ** 2 + (worldY - cy) ** 2) < FREEHAND_EDGE_HIT_DISTANCE) return true;
  }
  return false;
};

const hitsElement = (el: HeightmapElement, worldX: number, worldY: number): boolean => {
  if (el.shape.type === 'freehand' && el.shape.points && el.shape.points.length >= 3) {
    const pts = el.shape.points;
    return insidePolygon(pts, worldX, worldY) || nearPolygonEdge(pts, worldX, worldY);
  }
  const dx = Math.abs(worldX - el.shape.x);
  const dy = Math.abs(worldY - el.shape.y);
  return dx < el.shape.width / 2 + SHAPE_HIT_PADDING && dy < el.shape.height / 2 + SHAPE_HIT_PADDING;
};

const hitTest = (screenData: ScreenData, worldX: number, worldY: number): Hit | null => {
  for (let i = screenData.lights.length - 1; i >= 0; i--) {
    const light = screenData.lights[i];
    const dist = Math.sqrt((worldX - light.x) ** 2 + (worldY - light.y) ** 2);
    if (dist < LIGHT_HIT_RADIUS) return { id: light.id, type: 'light' };
  }

  for (let i = screenData.heightmap.length - 1; i >= 0; i--) {
    const el = screenData.heightmap[i];
    if (hitsElement(el, worldX, worldY)) return { id: el.id, type: 'heightmap' };
  }
  return null;
};

export { hitTest };
