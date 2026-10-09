/* @layer renderer-widgets @kind logic */
import type { TrailStop } from '@app/stores/simulator-store';

const haulAt = (trail: readonly TrailStop[], i: number, checksDone: number): number => {
  const next = trail[i + 1]?.checksAt ?? checksDone;
  return Math.max(0, next - trail[i].checksAt);
};

export { haulAt };
