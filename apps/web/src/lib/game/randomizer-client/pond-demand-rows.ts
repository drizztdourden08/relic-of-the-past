/* @layer bridge-wasm @kind logic */
/**
 * Pond demands for a session, the pure half: the placement's rolled demands in,
 * one row per prize rung of every custom pond out, in the core's own keys.
 *
 * A rung is position k in its pond's prize list (pondPlanOf), which is the
 * prize ordinal at the capacity pond and the rung of the ladder at a wish pond,
 * the same position the demand roll reads. Only a custom pond arms rows: a
 * pond at its native economy asks for what it always asked, and a legacy pond
 * has no rungs at all.
 *
 * Each row carries its three composed lines (pond-demand-messages.ts), looked
 * up by the same keys; a session without composed dialogue arms -1 for all
 * three, and the core then keeps each pond's own line at that beat.
 *
 * A pond arms whole or not at all. An item demand whose name has no receive id
 * would arm a demand the core could never test, so it refuses every row of its
 * pond and says why. Nothing here touches a module.
 */

import { pondProfilesOfStats } from '@shared/randomizer/ap-world/fill/placement-ponds';
import { POND_INSTANCES } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { nativeDemandOf } from './pond-demand-native';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { PondId } from '@shared/randomizer/ap-world/pond/pond-instance.type';
import type { PondDemandArm } from '../pond-demands';
import type { PondDemandMessagesOf } from './receipt-text-refresh';

/** No composed dialogue: every beat keeps the pond's own line. */
const NO_DEMAND_MESSAGES: PondDemandMessagesOf = () => ({ askMessageId: -1, refuseMessageId: -1, awardMessageId: -1 });

/** The core's key for each pond (core/game-hooks/pond_demands.h). */
const POND_DEMAND_KEY: Readonly<Record<PondId, number>> = { capacity: 0, wishing: 1, cursed: 2 };

/** One armed row, with the location it came from for the log and the harness. */
interface PondDemandRow extends PondDemandArm {
  location: string;
}

interface PondDemandSessionPlan {
  rows: readonly PondDemandRow[];
  /** One line per custom pond that armed nothing, naming the rung that stopped it. */
  refusals: readonly string[];
}

const pondDemandSessionOf = (
  placement: ApPlacement, receiveIdOf: (itemName: string) => number | undefined,
  messagesOf: PondDemandMessagesOf = NO_DEMAND_MESSAGES,
): PondDemandSessionPlan => {
  const profiles = pondProfilesOfStats(placement.stats);
  const demands = placement.pondDemands ?? {};
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
      else if (demand.kind !== 0) pondRows.push({ pond, rung, location, ...demand, ...messagesOf(pond, rung) });
    });
    if (refusal === undefined) rows.push(...pondRows);
    else refusals.push(refusal);
  }
  return { rows, refusals };
};

export { POND_DEMAND_KEY, pondDemandSessionOf };
export type { PondDemandRow, PondDemandSessionPlan };
