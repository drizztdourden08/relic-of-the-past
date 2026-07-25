/* @layer renderer-widgets @kind logic */
/**
 * A trail stop records the check tally on ARRIVAL, so the checks it earned are
 * the NEXT stop's arrival tally minus its own. The final stop has no successor
 * and is closed out against the live tally instead.
 */
import type { TrailStop } from '@app/stores/simulator-store';

const haulAt = (trail: readonly TrailStop[], i: number, checksDone: number): number => {
  const next = trail[i + 1]?.checksAt ?? checksDone;
  return Math.max(0, next - trail[i].checksAt);
};

export { haulAt };
