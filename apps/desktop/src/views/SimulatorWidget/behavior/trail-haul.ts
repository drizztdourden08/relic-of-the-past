/* @layer renderer-widgets @kind logic */
import type { TrailStop } from '@app/stores/simulator-store';

const haulAt = (trail: readonly TrailStop[], i: number, checksDone: number): number => {
  const stop = trail[i];
  if (stop === undefined) throw new Error(`trail has no stop ${String(i)}`);
  const next = trail[i + 1]?.checksAt ?? checksDone;
  return Math.max(0, next - stop.checksAt);
};

export { haulAt };
