/* @layer bridge-wasm @kind logic */
import { POND_INSTANCES } from '../world/pond/pond-instances';
import { pondPlanOf } from '../world/pond/pond-plan';
import { nativeDemandOf } from './pond-demand-native';
import { NO_DEMAND_MESSAGES, POND_DEMAND_KEY } from './pond-demand-rows.constants';
import { POND_DEMAND_KIND } from './pond-demand-native.constants';
import type { Placement } from '../world/fill/placement.type';
import type { PondDemandMessagesOf } from './receipt-text-refresh.type';
import type { PondDemandRow, PondDemandSessionPlan } from './pond-demand-rows.type';

const pondDemandSessionOf = (
  placement: Placement, receiveIdOf: (item: string) => number | undefined,
  messagesOf: PondDemandMessagesOf = NO_DEMAND_MESSAGES,
): PondDemandSessionPlan => {
  const profiles = placement.stats.ponds;
  const demands = placement.pondDemands;
  const rows: PondDemandRow[] = [];
  const refusals: string[] = [];
  for (const instance of POND_INSTANCES) {
    const setting = profiles[instance.id];
    if (setting.mode !== 'custom') continue;
    const pond = POND_DEMAND_KEY[instance.id];
    const pondRows: PondDemandRow[] = [];
    let refusal: string | undefined;
    pondPlanOf(setting, instance).locations.forEach((location, rung) => {
      const demand = nativeDemandOf(demands[location], receiveIdOf);
      if (typeof demand === 'string') refusal ??= `${instance.label}: "${location}" ${demand}`;
      else if (demand.kind !== POND_DEMAND_KIND.none) pondRows.push({ pond, rung, location, ...demand, ...messagesOf(pond, rung) });
    });
    if (refusal === undefined) rows.push(...pondRows);
    else refusals.push(refusal);
  }
  return { rows, refusals };
};

export { pondDemandSessionOf };
export type { PondDemandRow, PondDemandSessionPlan } from './pond-demand-rows.type';
