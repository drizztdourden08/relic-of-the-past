/* @layer shared-game @kind logic */
import { EXPLOSIVES, PROJECTILES } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import { POND_ASK_ROW_BY_KIND } from './pond-ask.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondAskAmountKind, PondAskSetting } from './pond-ask.type';
import type { PondPlan } from './pond-profile.type';
import type { PondAskRange } from './pond.type';

const ceilingOf = (kind: PondAskAmountKind, capacity: CapacityProfile): number => {
  if (kind === 'bombs') return reachableTopOf(EXPLOSIVES, capacity);
  if (kind === 'arrows') return reachableTopOf(PROJECTILES, capacity);
  return Number.POSITIVE_INFINITY;
};

const demandRangeOf = (
  kind: PondAskAmountKind, ask: PondAskSetting, plan: PondPlan, capacity: CapacityProfile,
): PondAskRange => {
  const { stops } = POND_ASK_ROW_BY_KIND[kind];
  const ceiling = ceilingOf(kind, capacity);
  if (kind !== 'rupees') return { stops, min: ask[kind].min, max: ask[kind].max, ceiling };
  const prices = plan.throws.map((entry) => entry.price);
  return { stops, min: prices[0] ?? 0, max: prices[prices.length - 1] ?? 0, ceiling };
};

export { demandRangeOf };
