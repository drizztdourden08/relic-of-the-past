/* @layer bridge-wasm @kind logic */
import { log } from '../../../../log-bus';
import type { PlanEntry } from '@rotp/randomizer';

const logOverride = (tag: string, entry: PlanEntry, what: string, targetLocalId: number): void => {
  log.randomizer(`${tag} Overrode "${entry.location}": ${what} -> "${entry.item}" (0x${targetLocalId.toString(16)})`);
};

export { logOverride };
