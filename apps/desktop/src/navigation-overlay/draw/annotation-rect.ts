/* @layer renderer-components @kind logic */
import type { ScreenAnnotation } from '@rotp/navigation';
import type { AnnotationRect } from './annotation-rect.type';
import type { DrawContext, ScreenOrigin } from './draw.type';
import { annotationFootprint } from './annotation-footprint';

const annotationRect = (dc: DrawContext, origin: ScreenOrigin, a: ScreenAnnotation): AnnotationRect | null => {
  const { scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX } = dc;
  const { sizeCols, sizeRows, nudgeCols, nudgeRows } = annotationFootprint(dc, a);

  const screenX = origin.x + a.tile.col * TILE_PX + nudgeCols - viewLeft;
  const screenY = origin.y + a.tile.row * TILE_PX + nudgeRows - viewTop;
  if (screenX < -sizeCols || screenX > snesW + sizeCols) return null;
  if (screenY < -sizeRows || screenY > snesH + sizeRows) return null;

  return { dx: screenX * scaleX, dy: screenY * scaleY, dw: sizeCols * scaleX, dh: sizeRows * scaleY };
};

export { annotationRect };
