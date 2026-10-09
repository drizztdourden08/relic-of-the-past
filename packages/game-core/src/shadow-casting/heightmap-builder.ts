/* @layer bridge-wasm @kind logic */
import type { HeightmapElement, ShapeDefinition } from '../shadow-casting-types';
import { distanceToShape } from './distance-to-shape';

const toLocal = (shape: ShapeDefinition, offsetX: number, offsetY: number): ShapeDefinition => ({
  ...shape,
  x: shape.x - offsetX,
  y: shape.y - offsetY,
  points: shape.points?.map(p => ({ x: p.x - offsetX, y: p.y - offsetY })),
});

const rasterizeElement = (buffer: Uint8Array, bufWidth: number, bufHeight: number, element: HeightmapElement, offsetX: number, offsetY: number): void => {
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
      if (!insideShape) continue;
      const idx = py * bufWidth + px;
      const byteVal = Math.round(height * 255);
      if (byteVal > buffer[idx]) {
        buffer[idx] = byteVal;
      }
    }
  }
};

const buildHeightmapTexture = (elements: HeightmapElement[], width: number, height: number, offsetX: number = 0, offsetY: number = 0): Uint8Array => {
  const buffer = new Uint8Array(width * height);

  for (const element of elements) {
    rasterizeElement(buffer, width, height, element, offsetX, offsetY);
  }

  return buffer;
};

export { buildHeightmapTexture };
