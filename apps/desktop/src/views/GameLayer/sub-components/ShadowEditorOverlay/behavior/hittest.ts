/* @layer renderer-components @kind logic */
import type { HeightmapElement } from '@rotp/game-core';
import { FREEHAND_EDGE_HIT_DISTANCE, LIGHT_HIT_RADIUS, SHAPE_HIT_PADDING } from './overlay.constants';
import type { Hit, Point, ScreenData } from './overlay.type';
import { polygonEdges } from './polygon-edges';

const insidePolygon = (pts: Point[], worldX: number, worldY: number): boolean => {
  let inside = false;
  for (const [pj, pk] of polygonEdges(pts)) {
    if (((pj.y > worldY) !== (pk.y > worldY)) && (worldX < (pk.x - pj.x) * (worldY - pj.y) / (pk.y - pj.y) + pj.x)) {
      inside = !inside;
    }
  }
  return inside;
};

const nearPolygonEdge = (pts: Point[], worldX: number, worldY: number): boolean => {
  for (const [pj, pk] of polygonEdges(pts)) {
    const dx = pj.x - pk.x, dy = pj.y - pk.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    let t = ((worldX - pk.x) * dx + (worldY - pk.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = pk.x + t * dx, cy = pk.y + t * dy;
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
  const light = [...screenData.lights].reverse()
    .find((l) => Math.sqrt((worldX - l.x) ** 2 + (worldY - l.y) ** 2) < LIGHT_HIT_RADIUS);
  if (light) return { id: light.id, type: 'light' };

  const el = [...screenData.heightmap].reverse().find((e) => hitsElement(e, worldX, worldY));
  if (el) return { id: el.id, type: 'heightmap' };
  return null;
};

export { hitTest };
