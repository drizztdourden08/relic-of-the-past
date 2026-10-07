/* @layer bridge-wasm @kind logic */
/**
 * Pond demands for a session, the impure half: hands every custom pond's rows
 * to the core's shared demand table in one call and logs what went in. The
 * translation itself is pond-demand-rows.ts.
 *
 * Every pond's visit reads the table (core/game-hooks/pond_demand_visit.c):
 * a rung with a row asks for its demand, takes it and throws it in before
 * the gift. A rupee row at the rupee pond is that throw's own price, which
 * the pond's own flow already charges.
 */

import { log } from '../../log-bus';
import { clearPondDemands, setPondDemands } from '../pond-demands';
import type { PondDemandSessionPlan } from './pond-demand-rows';

const hex = (id: number): string => `0x${id.toString(16).padStart(2, '0')}`;

const armPondDemandSession = (plan: PondDemandSessionPlan, tag: string): void => {
  const { rows, refusals } = plan;
  for (const refusal of refusals) log.randomizer(`${tag} Pond demands NOT armed for ${refusal}`, 'warn');
  setPondDemands(rows);
  if (rows.length === 0) return;
  log.randomizer(`${tag} Pond demands armed: `
    + rows.map((row) => `"${row.location}" kind ${row.kind} amount ${row.amount} id ${hex(row.nativeId)} `
      + `(lines ${row.askMessageId}/${row.refuseMessageId}/${row.awardMessageId})`).join(', '));
};

const disarmPondDemandSession = (): void => {
  clearPondDemands();
};

export { armPondDemandSession, disarmPondDemandSession };
