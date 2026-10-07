/* @layer bridge-wasm @kind logic */
/**
 * Whether a tracker row counts toward the run's check total. The roster also lists rows that
 * are not checks: the event records (beating Agahnim, the frog, the smiths among them) and the
 * status-only rows. Those stay in the list, but a total is its item
 * locations only, which is what an Archipelago room counts for the slot.
 */
import type { CheckRecord } from '@shared/game/data';

const isCountedCheck = (check: CheckRecord): boolean =>
  check.kind !== 'event' && check.statusOnly !== true;

export { isCountedCheck };
