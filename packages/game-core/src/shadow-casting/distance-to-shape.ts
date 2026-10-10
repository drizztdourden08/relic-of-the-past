/* @layer bridge-wasm @kind logic */
import type { ShapeDefinition } from '../shadow-casting-types';
import { ELLIPSE_MIN_SIDES } from './distance-to-shape.constants';
import type { LocalPoint, NGonSpec } from './distance-to-shape.type';

const distanceToNGon = (local: LocalPoint, ngon: NGonSpec): number => {
  const { x: lx, y: ly } = local;
  const { halfW, halfH, sides, cornerRadius } = ngon;
  const nx = lx / halfW;
  const ny = ly / halfH;

  const angleStep = (2 * Math.PI) / sides;
  const angle = Math.atan2(ny, nx);
  const sector = Math.round(angle / angleStep) * angleStep;

  const cos = Math.cos(sector);
  const sin = Math.sin(sector);

  const edgeDist = nx * cos + ny * sin;
  const polygonRadius = Math.cos(Math.PI / sides);
  const rawDist = edgeDist - polygonRadius;

  const effectiveRadius = cornerRadius * (1 - polygonRadius);
  const dist = rawDist + effectiveRadius;

  return dist * Math.min(halfW, halfH);
};

const distanceToPolygonPoints = (px: number, py: number, points: { x: number; y: number }[]): number => {
  let minDist = Infinity;
  let inside = false;

  for (const [i, current] of points.entries()) {
    const previous = points.at(i - 1);
    if (previous === undefined) continue;
    const xi = current.x, yi = current.y;
    const xj = previous.x, yj = previous.y;

    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }

    const dx = xj - xi;
    const dy = yj - yi;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 0 ? ((px - xi) * dx + (py - yi) * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const closestX = xi + t * dx;
    const closestY = yi + t * dy;
    const dist = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
    minDist = Math.min(minDist, dist);
  }

  return inside ? -minDist : minDist;
};

const rotatedOffset = (px: number, py: number, shape: ShapeDefinition): LocalPoint => {
  const rot = -(shape.rotation ?? 0) * Math.PI / 180;
  const lx = px - shape.x;
  const ly = py - shape.y;
  if (rot === 0) return { x: lx, y: ly };
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  return { x: lx * cos - ly * sin, y: lx * sin + ly * cos };
};

const distanceToShape = (px: number, py: number, shape: ShapeDefinition): number => {
  if (shape.type === 'freehand' && shape.points && shape.points.length >= 3) {
    return distanceToPolygonPoints(px, py, shape.points);
  }

  const scaleX = shape.scaleX ?? 1;
  const scaleY = shape.scaleY ?? 1;
  const rotated = rotatedOffset(px, py, shape);
  const local = { x: rotated.x / scaleX, y: rotated.y / scaleY };

  const sides = shape.sides ?? 4;
  const halfW = shape.width / 2 / scaleX;
  const halfH = shape.height / 2 / scaleY;

  if (sides >= ELLIPSE_MIN_SIDES) {
    const ex = local.x / halfW;
    const ey = local.y / halfH;
    return (Math.sqrt(ex * ex + ey * ey) - 1) * Math.min(halfW, halfH);
  }

  return distanceToNGon(local, { halfW, halfH, sides, cornerRadius: shape.cornerRadius ?? 0 });
};

export { distanceToShape };
