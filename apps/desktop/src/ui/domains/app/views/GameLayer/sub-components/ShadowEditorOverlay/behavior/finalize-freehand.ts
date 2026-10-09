/* @layer renderer-components @kind logic */
import type { ShapeDefinition } from '@shared/types/shadow-casting';
import { genId } from './gen-id';
import type { FinalizeFreehandArgs } from './overlay.type';

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

export { finalizeFreehand };
