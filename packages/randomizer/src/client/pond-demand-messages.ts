/* @layer bridge-wasm @kind logic */
import { POND_INSTANCES } from '../world/pond/pond-instances';
import { pondPlanOf } from '../world/pond/pond-plan';
import { pondDemandLinesOf } from '../receipt-text/pond-demand-lines';
import { receiptLineKey } from '../receipt-text/receipt-line.type/receipt-line-key';
import { POND_DEMAND_KEY } from './pond-demand-rows.constants';
import { pondDemandLineKey } from './pond-demand-line-key';
import type { Placement } from '../world/fill/placement.type';
import type { PondPlan } from '../world/pond/pond-profile.type';
import type { PondDemandPlace } from '../receipt-text/pond-demand-lines';
import type { ReceiptLine } from '@rotp/game-core';
import type { PlanPondDemandLines, PondDemandLineIndex } from './pond-demand-messages.type';

const placeAtCapacity = (plan: PondPlan, prize: number): PondDemandPlace => {
  const at = plan.throws.findIndex((entry) => entry.prize === prize);
  const laterThrowHoldsPrize = plan.throws.slice(at + 1).some((entry) => entry.prize >= 0);
  return laterThrowHoldsPrize ? 'more' : 'last';
};

const appendPondDemandLines = (placement: Placement, lines: ReceiptLine[]): PlanPondDemandLines => {
  const profiles = placement.stats.ponds;
  const demands = placement.pondDemands;
  const byText = new Map<string, number>();
  const indexOf = (line: ReceiptLine | undefined): number => {
    if (line === undefined) return -1;
    const key = receiptLineKey(line);
    const known = byText.get(key);
    if (known !== undefined) return known;
    byText.set(key, lines.length);
    lines.push(line);
    return lines.length - 1;
  };
  const byRung = new Map<string, PondDemandLineIndex>();
  for (const instance of POND_INSTANCES) {
    const setting = profiles[instance.id];
    if (setting.mode !== 'custom') continue;
    const pond = POND_DEMAND_KEY[instance.id];
    const plan = pondPlanOf(setting, instance);
    plan.locations.forEach((location, rung) => {
      const demand = demands[location];
      if (demand === undefined || (instance.id === 'capacity' && demand.currency === 'rupees')) return;
      const place = instance.id === 'capacity' ? placeAtCapacity(plan, rung) : 'wish';
      const { ask, refuse, award } = pondDemandLinesOf(demand, place);
      byRung.set(pondDemandLineKey(pond, rung), { ask: indexOf(ask), refuse: indexOf(refuse), award: indexOf(award) });
    });
  }
  return byRung;
};

export { appendPondDemandLines };
export type { PlanPondDemandLines, PondDemandLineIndex } from './pond-demand-messages.type';
