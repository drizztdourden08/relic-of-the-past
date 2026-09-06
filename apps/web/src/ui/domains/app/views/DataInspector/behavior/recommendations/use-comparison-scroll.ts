/* @layer renderer-app @kind logic */
/**
 * Keeps the two comparison panes scrolled together. The side the user scrolled
 * leads and gets no `scrollTo`; only the other side is driven. The follower's
 * programmatic scroll fires a native event, which `ScrollArea`'s guard swallows
 * so it cannot bounce the leader (see create-scroll-guard.ts and
 * tests/design-system/scroll-area-sync.keep.test.ts).
 */
import { useCallback, useState } from 'react';
import type { ScrollPosition } from '@ds/primitives';

type PaneSide = 'current' | 'proposed';

interface PaneScroll {
  onScroll: (position: ScrollPosition) => void;
  /** Undefined on the side that led the last scroll, because it needs no correction. */
  scrollTo: Partial<ScrollPosition> | undefined;
}

interface ComparisonScroll {
  current: PaneScroll;
  proposed: PaneScroll;
}

interface Lead {
  side: PaneSide;
  position: ScrollPosition;
}

/** The leader's offset for the follower, nothing for the leader. Pure, so it is testable without a DOM. */
const followerScrollTo = (lead: Lead | null, side: PaneSide): Partial<ScrollPosition> | undefined =>
  (lead && lead.side !== side ? lead.position : undefined);

const useComparisonScroll = (): ComparisonScroll => {
  const [lead, setLead] = useState<Lead | null>(null);

  const onCurrent = useCallback((position: ScrollPosition) => setLead({ side: 'current', position }), []);
  const onProposed = useCallback((position: ScrollPosition) => setLead({ side: 'proposed', position }), []);

  return {
    current: { onScroll: onCurrent, scrollTo: followerScrollTo(lead, 'current') },
    proposed: { onScroll: onProposed, scrollTo: followerScrollTo(lead, 'proposed') },
  };
};

export { followerScrollTo, useComparisonScroll };
export type { ComparisonScroll, Lead, PaneScroll, PaneSide };
