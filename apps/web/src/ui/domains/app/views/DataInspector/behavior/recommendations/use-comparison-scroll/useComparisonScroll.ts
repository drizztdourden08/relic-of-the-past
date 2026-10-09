/* @layer renderer-app @kind hook */
import { useCallback, useState } from 'react';
import type { ScrollPosition } from '@drizztdourden08/tessera/primitives';
import type { ComparisonScroll, Lead } from '../recommendations.type';
import { followerScrollTo } from './follower-scroll-to';

const useComparisonScroll = (): ComparisonScroll => {
  const [lead, setLead] = useState<Lead | null>(null);

  const onCurrent = useCallback((position: ScrollPosition) => setLead({ side: 'current', position }), []);
  const onProposed = useCallback((position: ScrollPosition) => setLead({ side: 'proposed', position }), []);

  return {
    current: { onScroll: onCurrent, scrollTo: followerScrollTo(lead, 'current') },
    proposed: { onScroll: onProposed, scrollTo: followerScrollTo(lead, 'proposed') },
  };
};

export { useComparisonScroll };
