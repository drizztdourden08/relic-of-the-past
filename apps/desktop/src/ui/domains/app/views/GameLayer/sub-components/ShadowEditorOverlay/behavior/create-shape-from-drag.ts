/* @layer renderer-components @kind logic */
import type { ShapeDefinition } from '@rotp/game-core';
import { genId } from './gen-id';
import { MIN_SHAPE_SIZE } from './overlay.constants';
import type { CreateShapeArgs } from './overlay.type';

const createShapeFromDrag = (a: CreateShapeArgs): void => {
  const w = Math.abs(a.worldPos.x - a.dragStart.x);
  const h = Math.abs(a.worldPos.y - a.dragStart.y);
  if (w < MIN_SHAPE_SIZE && h < MIN_SHAPE_SIZE) return;
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

export { createShapeFromDrag };
