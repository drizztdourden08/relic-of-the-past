/* @layer renderer-components @kind logic */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import { LAYOUT_CACHE_SIZE } from '../PadOverlay.constants';
import type { OverlayLayout, OverlayMetrics, OverlaySlotView } from '../PadOverlay.type';
import { layoutOverlay } from './layout-overlay';

const layouts = new Map<string, OverlayLayout>();

const keyOf = (slots: readonly OverlaySlotView[], outline: string, metrics: OverlayMetrics): string =>
  [outline.length, outline.slice(0, 24), metrics.width, metrics.height, metrics.fontPx, ...slots.map((slot) => `${slot.anchor}=${slot.label}`)].join('|');

const cachedLayout = (
  slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet, outline: string, metrics: OverlayMetrics,
): OverlayLayout => {
  const key = keyOf(slots, outline, metrics);
  const known = layouts.get(key);
  if (known) return known;
  const layout = layoutOverlay(slots, anchors, outline, metrics);
  if (layouts.size >= LAYOUT_CACHE_SIZE) layouts.delete(layouts.keys().next().value ?? '');
  layouts.set(key, layout);
  return layout;
};

export { cachedLayout };
