/* @layer renderer-components @kind logic */
import type { ScreenAnnotation } from '@rotp/navigation';
import type { AnnotationFootprint } from './annotation-rect.type';
import type { DrawContext } from './draw.type';
import { ANCHOR_NUDGE_TILES } from './draw.constants';
import { doorWideness } from './door-wideness';

const annotationFootprint = (dc: DrawContext, a: ScreenAnnotation): AnnotationFootprint => {
  const { TILE_PX } = dc;
  const nudge = ANCHOR_NUDGE_TILES * TILE_PX;
  const { wideCols, wideRows } = doorWideness(a);
  return {
    sizeCols: TILE_PX * (wideCols ? 4 : 2),
    sizeRows: TILE_PX * (wideRows ? 4 : 2),
    nudgeCols: wideCols ? 0 : nudge,
    nudgeRows: wideRows ? 0 : nudge,
  };
};

export { annotationFootprint };
