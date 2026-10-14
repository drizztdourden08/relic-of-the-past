/* @layer renderer-components @kind hook */
import { useState } from 'react';
import type { PositionalRefs } from './positional-capture.type';

const usePositionalRefs = (): PositionalRefs => {
  const [refs] = useState<PositionalRefs>(() => ({
    targetsRef: { current: [] },
    trimmedRef: { current: false },
    activeIndexRef: { current: -1 },
    inputPhaseActiveRef: { current: false },
    autoAdvanceRef: { current: false },
    baselineRef: { current: null },
    latestSampleRef: { current: null },
    rangesRef: { current: [] },
    awaitingRestRef: { current: false },
  }));
  return refs;
};

export { usePositionalRefs };
