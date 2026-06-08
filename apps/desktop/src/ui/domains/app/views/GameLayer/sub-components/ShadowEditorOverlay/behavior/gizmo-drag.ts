/* @layer renderer-components @kind logic */
import type { HeightmapElement, LightSource } from '@shared/types/shadow-casting';
import type { GizmoPart } from '../../shadow-editor/gizmos';
import type { GizmoStart } from '../ShadowEditorOverlay.type';

type Point = { x: number; y: number };
type UpdateHeightmap = (screenId: number, id: string, patch: Partial<HeightmapElement>) => void;
type UpdateLight = (screenId: number, id: string, patch: Partial<LightSource>) => void;

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

const vertexFromRegularPolygon = (el: HeightmapElement): Point[] => {
  const sides = el.shape.sides ?? 4;
  const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
  const hw = el.shape.width / 2;
  const hh = el.shape.height / 2;
  const rot = (el.shape.rotation ?? 0) * Math.PI / 180;
  const pts: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 + startAngle;
    const lx = Math.cos(a) * hw, ly = Math.sin(a) * hh;
    pts.push({ x: el.shape.x + (lx * Math.cos(rot) - ly * Math.sin(rot)), y: el.shape.y + (lx * Math.sin(rot) + ly * Math.cos(rot)) });
  }
  return pts;
};

const bounds = (pts: Point[]) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  return { minX, minY, maxX, maxY };
};

const applyVertexDrag = (a: HeightmapGizmoArgs, vertexIdx: number): void => {
  const { el, screenId, worldPos, update } = a;
  if (el.shape.type === 'polygon' && !el.shape.points) {
    const pts = vertexFromRegularPolygon(el);
    if (vertexIdx < pts.length) pts[vertexIdx] = { x: worldPos.x, y: worldPos.y };
    const b = bounds(pts);
    update(screenId, el.id, { shape: { ...el.shape, type: 'freehand', x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2, width: b.maxX - b.minX, height: b.maxY - b.minY, points: pts, rotation: 0, sides: undefined } });
  } else if (el.shape.points) {
    const pts = [...el.shape.points];
    if (vertexIdx < pts.length) {
      pts[vertexIdx] = { x: worldPos.x, y: worldPos.y };
      const b = bounds(pts);
      update(screenId, el.id, { shape: { ...el.shape, x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2, width: b.maxX - b.minX, height: b.maxY - b.minY, points: pts } });
    }
  }
};

const applyHeightmapGizmo = (a: HeightmapGizmoArgs): void => {
  const { part, el, screenId, worldPos, gizmoStart, dx, dy, update } = a;
  switch (part) {
    case 'move-center': update(screenId, el.id, { shape: { ...el.shape, x: gizmoStart.x + dx, y: gizmoStart.y + dy } }); break;
    case 'move-x': update(screenId, el.id, { shape: { ...el.shape, x: gizmoStart.x + dx } }); break;
    case 'move-y': update(screenId, el.id, { shape: { ...el.shape, y: gizmoStart.y + dy } }); break;
    case 'resize-x': update(screenId, el.id, { shape: { ...el.shape, width: Math.max(4, gizmoStart.width + dx * 2) } }); break;
    case 'resize-y': update(screenId, el.id, { shape: { ...el.shape, height: Math.max(4, gizmoStart.height - dy * 2) } }); break;
    case 'resize-uniform': {
      const scale = 1 + ((-dx - dy) / 100);
      update(screenId, el.id, { shape: { ...el.shape, width: Math.max(4, gizmoStart.width * scale), height: Math.max(4, gizmoStart.height * scale) } });
      break;
    }
    case 'rotate': {
      const angle = Math.atan2(worldPos.y - el.shape.y, worldPos.x - el.shape.x);
      update(screenId, el.id, { shape: { ...el.shape, rotation: (angle * 180 / Math.PI + 360) % 360 } });
      break;
    }
    default: {
      const m = part.match(/^vertex-(\d+)$/);
      if (m) applyVertexDrag(a, parseInt(m[1], 10));
      break;
    }
  }
};

interface LightGizmoArgs {
  part: GizmoPart;
  light: LightSource;
  screenId: number;
  gizmoStart: GizmoStart;
  dx: number;
  dy: number;
  update: UpdateLight;
}

const applyLightGizmo = (a: LightGizmoArgs): void => {
  const { part, light, screenId, gizmoStart, dx, dy, update } = a;
  if (part !== 'move-center' && part !== 'move-x' && part !== 'move-y') return;
  const nx = part === 'move-y' ? light.x : gizmoStart.x + dx;
  const ny = part === 'move-x' ? light.y : gizmoStart.y + dy;
  update(screenId, light.id, { x: nx, y: ny });
};

export type { UpdateHeightmap, UpdateLight };
export { applyHeightmapGizmo, applyLightGizmo };
