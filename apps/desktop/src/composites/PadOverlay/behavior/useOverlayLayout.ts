/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import type { OverlayLayout, OverlayMetrics, OverlaySlotView } from '../PadOverlay.type';
import { LAYOUT_DELAY_MS } from '../PadOverlay.constants';
import { cachedLayout } from './cached-layout';

const useOverlayLayout = (
  slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet, outline: string, metrics: OverlayMetrics | null,
): OverlayLayout | null => {
  const [layout, setLayout] = useState<OverlayLayout | null>(null);

  useEffect(() => {
    if (!metrics) return undefined;
    const timer = setTimeout(() => setLayout(cachedLayout(slots, anchors, outline, metrics)), LAYOUT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [slots, anchors, outline, metrics]);

  return layout;
};

export { useOverlayLayout };
