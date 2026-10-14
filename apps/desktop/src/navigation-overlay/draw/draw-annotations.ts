/* @layer renderer-components @kind logic */
import type { ScreenAnnotations } from '@rotp/navigation';
import type { DrawContext } from './draw.type';
import { styleForKind } from '../annotation-style';
import { annotationRect } from './annotation-rect';
import { drawAnnotationBox } from './draw-annotation-box';

const drawAnnotations = (dc: DrawContext, sets: readonly ScreenAnnotations[], hidden?: ReadonlySet<string>): void => {
  const { ctx, scaleX, scaleY, getScreenWorldOrigin } = dc;
  const scale = Math.min(scaleX, scaleY);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const set of sets) {
    const origin = getScreenWorldOrigin(set.screenIndex);
    for (const a of set.items) {
      const style = styleForKind(a.kind);
      if (style.panelOnly || hidden?.has(a.kind)) continue;
      const rect = annotationRect(dc, origin, a);
      if (rect) drawAnnotationBox({ ctx, style, rect, state: a.state, scale });
    }
  }

  ctx.restore();
};

export { drawAnnotations };
