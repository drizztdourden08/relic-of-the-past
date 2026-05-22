/**
 * Heightmap Builder — Rasterizes HeightmapElement shapes into a pixel buffer
 * that gets uploaded as a texture to the shadow shader.
 */

import type { HeightmapElement, ShapeDefinition } from '@shared/types/shadow-casting';

/**
 * Build a heightmap texture from a list of heightmap elements.
 * Returns a Uint8Array (single channel, R = height * 255) sized width × height.
 *
 * @param offsetX World X origin of the current screen (subtracted from shape coords)
 * @param offsetY World Y origin of the current screen (subtracted from shape coords)
 */
function buildHeightmapTexture(
  elements: HeightmapElement[],
  width: number,
  height: number,
  offsetX: number = 0,
  offsetY: number = 0,
): Uint8Array {
  const buffer = new Uint8Array(width * height);

  for (const element of elements) {
    rasterizeElement(buffer, width, height, element, offsetX, offsetY);
  }

  return buffer;
}

function rasterizeElement(
  buffer: Uint8Array,
  bufWidth: number,
  bufHeight: number,
  element: HeightmapElement,
  offsetX: number,
  offsetY: number,
): void {
  const { shape, height, smoothing } = element;

  // Convert world-space shape to screen-local coordinates
  const localShape: ShapeDefinition = {
    ...shape,
    x: shape.x - offsetX,
    y: shape.y - offsetY,
    points: shape.points?.map(p => ({ x: p.x - offsetX, y: p.y - offsetY })),
  };

  // Compute bounding box for the shape
  const halfW = localShape.width / 2;
  const halfH = localShape.height / 2;
  const margin = smoothing;

  const minX = Math.max(0, Math.floor(localShape.x - halfW - margin));
  const maxX = Math.min(bufWidth - 1, Math.ceil(localShape.x + halfW + margin));
  const minY = Math.max(0, Math.floor(localShape.y - halfH - margin));
  const maxY = Math.min(bufHeight - 1, Math.ceil(localShape.y + halfH + margin));

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const dist = distanceToShape(px, py, localShape);
      let value: number;

      if (dist <= 0) {
        // Inside shape
        value = height;
      } else if (smoothing > 0 && dist < smoothing) {
        // In smoothing zone — linear falloff
        value = height * (1 - dist / smoothing);
      } else {
        continue;
      }

      const idx = py * bufWidth + px;
      // Max blend: tallest element wins
      const byteVal = Math.round(value * 255);
      if (byteVal > buffer[idx]) {
        buffer[idx] = byteVal;
      }
    }
  }
}

/**
 * Compute signed distance from a pixel to a shape.
 * Negative = inside, positive = outside.
 */
function distanceToShape(px: number, py: number, shape: ShapeDefinition): number {
  if (shape.type === 'freehand' && shape.points && shape.points.length >= 3) {
    return distanceToPolygonPoints(px, py, shape.points);
  }

  // Transform point into shape-local space (handle rotation + scale)
  const rot = -(shape.rotation ?? 0) * Math.PI / 180;
  const scaleX = shape.scaleX ?? 1;
  const scaleY = shape.scaleY ?? 1;

  let lx = px - shape.x;
  let ly = py - shape.y;

  // Apply inverse rotation
  if (rot !== 0) {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const nx = lx * cos - ly * sin;
    const ny = lx * sin + ly * cos;
    lx = nx;
    ly = ny;
  }

  // Apply inverse scale
  lx /= scaleX;
  ly /= scaleY;

  const sides = shape.sides ?? 4;
  const cornerRadius = shape.cornerRadius ?? 0;
  const halfW = shape.width / 2 / scaleX;
  const halfH = shape.height / 2 / scaleY;

  if (sides >= 32) {
    // Treat as ellipse
    const ex = lx / halfW;
    const ey = ly / halfH;
    return (Math.sqrt(ex * ex + ey * ey) - 1) * Math.min(halfW, halfH);
  }

  // N-sided polygon SDF with corner radius
  return distanceToNGon(lx, ly, halfW, halfH, sides, cornerRadius);
}

function distanceToNGon(
  lx: number,
  ly: number,
  halfW: number,
  halfH: number,
  sides: number,
  cornerRadius: number,
): number {
  // Normalize to unit space
  const nx = lx / halfW;
  const ny = ly / halfH;

  // Regular polygon SDF
  const angleStep = (2 * Math.PI) / sides;
  const angle = Math.atan2(ny, nx);
  const sector = Math.round(angle / angleStep) * angleStep;

  const cos = Math.cos(sector);
  const sin = Math.sin(sector);

  // Project onto edge normal
  const edgeDist = nx * cos + ny * sin;
  const polygonRadius = Math.cos(Math.PI / sides);
  const rawDist = edgeDist - polygonRadius;

  // Apply corner radius (shrink polygon, round corners)
  const effectiveRadius = cornerRadius * (1 - polygonRadius);
  const dist = rawDist + effectiveRadius;

  // Scale back to pixel space
  return dist * Math.min(halfW, halfH);
}

function distanceToPolygonPoints(
  px: number,
  py: number,
  points: { x: number; y: number }[],
): number {
  const n = points.length;
  let minDist = Infinity;
  let inside = false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;

    // Point-in-polygon test (ray casting)
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }

    // Distance to edge segment
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
}

export { buildHeightmapTexture };
