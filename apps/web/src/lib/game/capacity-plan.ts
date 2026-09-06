/* @layer bridge-wasm @kind logic */
/**
 * Capacity plan: JS-side arming of the per-family jump sequence the core's
 * progressive climb reads (core/game-hooks/capacity_progressive.c): entry k
 * is the k-th pickup's jump in rungs and, when the session pre-rendered one,
 * the message id of its receipt line. Record-only writes, the same contract
 * as the profile and the wallet table; the read side answers to
 * kFeatures3_CapacityProfile inside the gated grant seams. The session layer
 * composes the sequence from the family plans; this file is the ccall
 * surface only.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { CAPACITY_FAMILY_INDEX, CAPACITY_FAMILY_LAST_TIER } from './capacity-profile.constants';
import type { CapacityFamilyId } from '@shared/game/data';

/** No pre-rendered line: the core falls back to the family's class message. */
const NO_MESSAGE = -1;

// Arm one family's sequence: |jumps[k]| rungs for the k-th pickup, |messageIds[k]| its
// receipt line (absent entries fall back). The whole ladder is bounded by the family's
// rung count, so a sequence longer than that is refused, not truncated in C.
const setCapacityPlanJumps = (
  family: CapacityFamilyId, jumps: readonly number[], messageIds: readonly number[] = [],
): void => {
  if (jumps.length > CAPACITY_FAMILY_LAST_TIER[family]) {
    log.error(`[Randomizer] Capacity plan refused: ${family} carries ${jumps.length} jumps over a `
      + `${CAPACITY_FAMILY_LAST_TIER[family]}-rung ladder`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setCapacityPlanJumps called with no active module');
    return;
  }
  jumps.forEach((jump, index) => {
    mod.ccall('WasmSetCapacityPlanJump', null, ['number', 'number', 'number', 'number'],
      [CAPACITY_FAMILY_INDEX[family], index, Math.max(1, Math.trunc(jump)), messageIds[index] ?? NO_MESSAGE]);
  });
  log.randomizer(`[Randomizer] Capacity plan set: ${family} [${jumps.join(', ')}]`
    + (messageIds.length > 0 ? ` (lines ${messageIds[0]}..${messageIds[messageIds.length - 1]})` : ''));
};

const clearCapacityPlan = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCapacityPlan', null, [], []);
  log.randomizer('[Randomizer] Capacity plan cleared');
};

export { clearCapacityPlan, setCapacityPlanJumps };
