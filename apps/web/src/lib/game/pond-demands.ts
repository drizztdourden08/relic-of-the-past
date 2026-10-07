/* @layer bridge-wasm @kind logic */
/**
 * Pond demands: JS-side arming for the demand table all three ponds read
 * (core/game-hooks/pond_demands.c). One row per prize rung, keyed by the pond
 * and the rung's place in that pond's prize list, with the three lines the
 * pond speaks for it. The table itself changes nothing the game computes: the
 * pond plans' own gate bits decide whether a visit reads it
 * (core/game-hooks/pond_demand_visit.c), so there is no bit to request here.
 * It is host session state, emptied at every arm and every stop. The session
 * layer composes the rows; this file is the ccall surface only.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';

/** One rung's demand, as the core stores it (pond-demand-native.ts has the encoding). */
interface PondDemandArm {
  /** The core's pond key: 0 the capacity pond, 1 the wishing pond, 2 the cursed pond. */
  pond: number;
  /** Its place in that pond's prize list, from zero. */
  rung: number;
  kind: number;
  amount: number;
  /** The bottle-slot value, or the item's receive id; 0 for a counted demand. */
  nativeId: number;
  /** The yes/no line naming the demand, or -1 to keep the pond's own contact line. */
  askMessageId: number;
  /** The line for a yes that cannot pay, or -1 to keep the pond's own refusal. */
  refuseMessageId: number;
  /** The line she rises with, or -1 to keep the pond's own award line. */
  awardMessageId: number;
}

/** Empty the table, then arm every row in one pass. */
const setPondDemands = (demands: readonly PondDemandArm[]): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondDemands called with no active module');
    return;
  }
  mod.ccall('WasmClearPondDemands', null, [], []);
  demands.forEach(({ pond, rung, kind, amount, nativeId, askMessageId, refuseMessageId, awardMessageId }) => {
    mod.ccall('WasmArmPondDemand', null, ['number', 'number', 'number', 'number', 'number'],
      [pond, rung, kind, amount, nativeId]);
    mod.ccall('WasmSetPondDemandLines', null, ['number', 'number', 'number', 'number', 'number'],
      [pond, rung, askMessageId, refuseMessageId, awardMessageId]);
  });
  log.randomizer(`[Randomizer] Pond demands set: ${demands.length} rungs`);
};

const clearPondDemands = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearPondDemands', null, [], []);
  log.randomizer('[Randomizer] Pond demands cleared');
};

export { clearPondDemands, setPondDemands };
export type { PondDemandArm };
