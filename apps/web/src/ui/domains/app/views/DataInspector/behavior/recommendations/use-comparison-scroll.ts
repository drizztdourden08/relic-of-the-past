/* @layer renderer-app @kind logic */
/**
 * Keeps the two comparison panes scrolled together.
 *
 * Whichever side the user actually scrolled becomes the leader, and only the
 * OTHER side is driven — the leader is handed no `scrollTo` at all, so nothing
 * ever pushes a pane back to where it already is. That is the same shape
 * `ScrollArea`'s guard exists for (see create-scroll-guard.ts and
 * tests/design-system/scroll-area-sync.test.ts): the follower's programmatic
 * scroll fires a native event, and the guard swallows it rather than letting it
 * come back as a "user scrolled the follower" and bounce the leader.
 */
import { useCallback, useState } from 'react';
import type { ScrollPosition } from '@ds/primitives';

type PaneSide = 'current' | 'proposed';

interface PaneScroll {
  onScroll: (position: ScrollPosition) => void;
  /** Undefined on the side that led the last scroll — it needs no correction. */
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

/**
 * What a given side should be driven to: the leader's offset when it is the
 * follower, and nothing at all when it is the leader itself. Pure, so the whole
 * mirroring rule can be checked against a pair of real scroll controllers
 * without a DOM.
 */
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
