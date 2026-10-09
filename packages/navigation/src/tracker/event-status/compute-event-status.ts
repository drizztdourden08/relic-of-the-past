/* @layer bridge-wasm @kind logic */
import { all } from '@rotp/game-data';
import type { CheckId, CheckRecord } from '@rotp/game-data';
import { evaluatePresence } from '../../simulation/presence/evaluate';
import type { PresenceGameState } from '../../simulation/presence/state';

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

export { computeEventStatus };
