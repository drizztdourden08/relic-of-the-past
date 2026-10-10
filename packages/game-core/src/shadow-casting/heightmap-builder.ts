/* @layer bridge-wasm @kind logic */
import type { HeightmapElement, ShapeDefinition } from '../shadow-casting-types';
import { distanceToShape } from './distance-to-shape';
import type { HeightmapArea } from './heightmap-builder.type';

const toLocal = (shape: ShapeDefinition, offsetX: number, offsetY: number): ShapeDefinition => ({
  ...shape,
  x: shape.x - offsetX,
  y: shape.y - offsetY,
  points: shape.points?.map(p => ({ x: p.x - offsetX, y: p.y - offsetY })),
});

const rasterizeElement = (buffer: Uint8Array, area: HeightmapArea, element: HeightmapElement): void => {
  const { width: bufWidth, height: bufHeight, offsetX = 0, offsetY = 0 } = area;
  const { shape, height } = element;
  const localShape = toLocal(shape, offsetX, offsetY);

  const halfW = localShape.width / 2;
  const halfH = localShape.height / 2;

  const minX = Math.max(0, Math.floor(localShape.x - halfW));
  const maxX = Math.min(bufWidth - 1, Math.ceil(localShape.x + halfW));
  const minY = Math.max(0, Math.floor(localShape.y - halfH));
  const maxY = Math.min(bufHeight - 1, Math.ceil(localShape.y + halfH));

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const insideShape = distanceToShape(px, py, localShape) <= 0;
      const idx = py * bufWidth + px;
      const byteVal = Math.round(height * 255);
      const current = buffer[idx];
      if (insideShape && current !== undefined && byteVal > current) buffer[idx] = byteVal;
    }
  }
};

const buildHeightmapTexture = (elements: HeightmapElement[], area: HeightmapArea): Uint8Array => {
  const buffer = new Uint8Array(area.width * area.height);

  for (const element of elements) {
    rasterizeElement(buffer, area, element);
  }

  return buffer;
};

export { buildHeightmapTexture };
