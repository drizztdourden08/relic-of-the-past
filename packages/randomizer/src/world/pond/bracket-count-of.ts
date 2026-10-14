/* @layer shared-game @kind logic */
import { stopsInRange } from './pond-demand-ramp';
import { demandRangeOf } from './demand-range-of';
import type { DemandKind, DemandContext } from './pond.type';

const bracketCountOf = (kind: DemandKind, context: DemandContext, candidates: readonly string[]): number => {
  const { ask, plan, capacity } = context;
  if (kind === 'item') return candidates.length;
  if (kind === 'rupees') return new Set(plan.throws.map((entry) => entry.price)).size;
  const bottleContentCount = kind === 'bottle' ? ask.bottle.contents.length : 1;
  return stopsInRange(demandRangeOf(kind, ask, plan, capacity)).length * bottleContentCount;
};

export { bracketCountOf };
