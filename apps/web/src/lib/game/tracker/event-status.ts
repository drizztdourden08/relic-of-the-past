/* @layer bridge-wasm @kind logic */
/**
 * The live side of the reversible events: for every record with a `now` condition, whether
 * it holds this poll. Pure over a presence snapshot, the same language the simulator reads
 * NPC presence with, so a status is one declarative condition on the record and nothing
 * else. It never touches the completed set: an event that happened stays ticked, and this
 * only says whether it is true right now.
 */
import { all } from '@shared/game/data';
import type { CheckId, CheckRecord } from '@shared/game/data';
import { evaluatePresence } from '@shared/game/simulation/presence/evaluate';
import type { PresenceGameState } from '@shared/game/simulation/presence/state';

const computeEventStatus = (
  state: PresenceGameState,
  checks: readonly CheckRecord[] = all('check'),
): Map<CheckId, boolean> => {
  const status = new Map<CheckId, boolean>();
  for (const check of checks) {
    if (check.now === undefined) continue;
    status.set(check.id, evaluatePresence(check.now, state));
  }
  return status;
};

const eventStatusEqual = (a: ReadonlyMap<CheckId, boolean>, b: ReadonlyMap<CheckId, boolean>): boolean => {
  if (a.size !== b.size) return false;
  for (const [id, value] of a) if (b.get(id) !== value) return false;
  return true;
};

export { computeEventStatus, eventStatusEqual };
