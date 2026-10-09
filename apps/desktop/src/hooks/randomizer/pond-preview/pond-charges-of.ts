/* @layer renderer-hooks @kind logic */
import type { PondDemandView } from '@rotp/randomizer';
import type { PondPlan } from '@rotp/randomizer';
import type { PondCharge } from './pond-preview.type';

const pondChargesOf = (plan: PondPlan, demands: PondDemandView): readonly PondCharge[] =>
  plan.throws.map((entry) => {
    const rung = plan.mode === 'custom' && entry.prize >= 0 ? plan.locations[entry.prize] : undefined;
    const demand = rung === undefined ? undefined : demands[rung];
    if (demand === undefined) return { rupees: entry.price, other: false };
    if (demand.currency === 'rupees') return { demand, rupees: demand.amount, other: false };
    return { demand, rupees: 0, other: true };
  });

export { pondChargesOf };
