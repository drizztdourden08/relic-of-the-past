/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import type { FittedOverlay, OverlayMetrics, OverlaySlotView } from '../PadOverlay.type';
import { nextBase } from './next-base';
import { useOverlayLayout } from './useOverlayLayout';
import { useOverlayMetrics } from './useOverlayMetrics';

const useFittedOverlay = (
  ref: RefObject<HTMLElement | null>, slots: readonly OverlaySlotView[], anchors: ControllerSilhouetteAnchorSet, outline: string,
): FittedOverlay => {
  const measured = useOverlayMetrics(ref);
  const [base, setBase] = useState<OverlayMetrics | null>(null);
  const layout = useOverlayLayout(slots, anchors, outline, base);
  const grownTo = layout && base && layout.frame.height > base.height ? layout.frame.height : 0;

  useEffect(() => {
    if (measured) setBase((previous) => nextBase(previous, measured, grownTo));
  }, [measured, grownTo]);

  return { layout, grownTo };
};

export { useFittedOverlay };
