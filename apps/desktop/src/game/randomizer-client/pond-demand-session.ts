/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { setPondDemands } from '../pond-demands';
import type { PondDemandSessionPlan } from '@rotp/randomizer';

const hex = (id: number): string => `0x${id.toString(16).padStart(2, '0')}`;

const armPondDemandSession = (plan: PondDemandSessionPlan, tag: string): void => {
  const { rows, refusals } = plan;
  for (const refusal of refusals) log.randomizer(`${tag} Pond demands NOT armed for ${refusal}`, 'warn');
  setPondDemands(rows);
  if (rows.length === 0) return;
  log.randomizer(`${tag} Pond demands armed: ${
     rows.map((row) => `"${row.location}" kind ${row.kind} amount ${row.amount} id ${hex(row.nativeId)} `
      + `(lines ${row.askMessageId}/${row.refuseMessageId}/${row.awardMessageId})`).join(', ')}`);
};

export { armPondDemandSession };
