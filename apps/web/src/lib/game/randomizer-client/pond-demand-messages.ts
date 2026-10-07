/* @layer bridge-wasm @kind logic */
/**
 * The pond demand lines in the session's composed pool: for every rung of a
 * custom pond whose demand the core asks, its ask, refuse and award lines
 * (pond-demand-lines.ts), appended in pond and rung order and looked up by
 * the core's own (pond, rung) keys.
 *
 * The core asks every demand but one: a rupee demand at the rupee pond is
 * that throw's own price, charged by the pond's own flow with its own lines,
 * so it gets none here. The rupee pond's award line says whether the water
 * still holds a prize after this one, read from the plan's throws exactly as
 * the core reads them.
 *
 * Rungs asking for the same thing speak the same words, so a line already in
 * the pool is reused, and the pool stays small however long the ladders are.
 */

import { pondProfilesOfStats } from '@shared/randomizer/ap-world/fill/placement-ponds';
import { POND_INSTANCES } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { pondDemandLinesOf } from '@shared/randomizer/receipt-text/pond-demand-lines';
import { receiptLineKey } from '@shared/randomizer/receipt-text/receipt-line.type';
import { POND_DEMAND_KEY } from './pond-demand-rows';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { PondPlan } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { PondDemandPlace } from '@shared/randomizer/receipt-text/pond-demand-lines';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

/** Where one rung's three lines landed in the pool; -1 for a line it has none of. */
interface PondDemandLineIndex {
  ask: number;
  refuse: number;
  award: number;
}

/** `${pond}:${rung}` in the core's keys → where that rung's lines landed. */
type PlanPondDemandLines = ReadonlyMap<string, PondDemandLineIndex>;

const pondDemandLineKey = (pond: number, rung: number): string => `${pond}:${rung}`;

/** Whether a later throw than the one carrying |prize| still carries a prize. */
const placeAtCapacity = (plan: PondPlan, prize: number): PondDemandPlace => {
  const at = plan.throws.findIndex((entry) => entry.prize === prize);
  return plan.throws.slice(at + 1).some((entry) => entry.prize >= 0) ? 'more' : 'last';
};

const appendPondDemandLines = (placement: ApPlacement, lines: ReceiptLine[]): PlanPondDemandLines => {
  const profiles = pondProfilesOfStats(placement.stats);
  const demands = placement.pondDemands ?? {};
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

export { appendPondDemandLines, pondDemandLineKey };
export type { PlanPondDemandLines, PondDemandLineIndex };
