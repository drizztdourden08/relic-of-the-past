/* @layer bridge-wasm @kind logic */
/**
 * Pond plan: JS-side arming for the in-core rupee-pond plan
 * (core/game-hooks/pond_plan.c): one row per throw (its price, the prize
 * ordinal it hands over or -1, the consolation it pays back, the pre-rendered
 * lines announcing the price and the consolation) and one row per prize slot
 * (the assigned item, its receipt line, its completion fire id), plus the
 * lines the pond itself speaks: the two a throw carrying a pool item shows in
 * place of the native capacity question, one for a water that still holds a
 * prize and one for the throw that takes the last, and the one an emptied
 * pond shows.
 * Same contract as the other
 * override bridges: every write only records, the gate bit is requested
 * alongside it, and it stays open only while a plan is armed. The session
 * layer composes the rows from the placement; this file is the ccall surface
 * only.
 */

import { isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setPondPlanActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

/** One purchase at the pond, as the core reads it. */
interface PondThrowArm {
  price: number;
  /** Prize ordinal handed over, or -1 when the throw sells a capacity level. */
  prize: number;
  /** Rupees handed back when the throw wins nothing; always below the price. */
  refund: number;
  /** Pre-rendered line announcing the price, or -1 for no prompt. */
  prompt: number;
  /** Pre-rendered line for a throw that wins nothing, or -1 to keep the native one. */
  consolation: number;
}

/** The grant sitting on one prize ordinal. */
interface PondPrizeArm {
  prize: number;
  newItem: number;
  messageId: number;
  fireId: number;
}

const setPondThrows = (throws: readonly PondThrowArm[]): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondThrows called with no active module');
    return;
  }
  // Arm the gate with the record-only writes, so it has latched into WRAM
  // (SyncGateWords, next frame) by the time the pond's handler reads a price.
  setPondPlanActive(true);
  reassertGateWord3();
  mod.ccall('WasmClearPondPlan', null, [], []);
  throws.forEach((entry, index) => {
    mod.ccall('WasmSetPondThrow', null, ['number', 'number', 'number', 'number', 'number', 'number'],
      [index, Math.trunc(entry.price), Math.trunc(entry.prize), Math.trunc(entry.refund),
        entry.prompt, entry.consolation]);
  });
  log.randomizer(`[Randomizer] Pond plan set: ${throws.length} throws `
    + `[${throws.map((entry) => entry.price).join(', ')}]`);
};

const setPondPrize = (arm: PondPrizeArm): void => {
  const { prize, newItem, messageId, fireId } = arm;
  if (!isGrantableReceiveId(newItem)) {
    log.error(`[Randomizer] Pond prize refused: item 0x${newItem.toString(16)} `
      + `is outside the grantable id range (prize ${prize})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondPrize called with no active module');
    return;
  }
  mod.ccall('WasmSetPondPrize', null, ['number', 'number', 'number', 'number'],
    [prize, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Pond prize ${prize} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

/**
 * The line an emptied pond shows instead of the native come-back-later
 * refusal. -1 keeps that native line, which is also what a wallet too light
 * for the current price still shows: only an exhausted pond speaks this one.
 */
const setPondClosedMessage = (messageId: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondClosedMessage called with no active module');
    return;
  }
  mod.ccall('WasmSetPondClosedMessage', null, ['number'], [messageId]);
  log.randomizer(`[Randomizer] Pond closing line -> msg ${messageId}`);
};

/**
 * The two lines a throw carrying a pool item shows in place of the native
 * question asking which capacity family to climb: |more| while the water still
 * holds a prize after this one, |last| for the throw that takes the final one.
 * -1 keeps that question, and with it the two-way choice: the native line is
 * one box and so is each of these, so the purchase asks for the same
 * confirmations either way, and an empty seam would drop one.
 */
const setPondAwardMessage = (more: number, last: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondAwardMessage called with no active module');
    return;
  }
  mod.ccall('WasmSetPondAwardMessage', null, ['number', 'number'], [more, last]);
  log.randomizer(`[Randomizer] Pond award lines -> msg ${more} (more to come), msg ${last} (the last)`);
};

/** Throws taken on the live file: what the probes and the tracker read back. */
const pondThrowsTaken = (): number => {
  const mod = getModule();
  return mod ? (mod.ccall('WasmPondThrowsTaken', 'number', [], []) as number) : 0;
};

const clearPondPlan = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the plan, then close the gate, the same double lock as the other tables.
  mod.ccall('WasmClearPondPlan', null, [], []);
  setPondPlanActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] Pond plan cleared');
};

export {
  clearPondPlan, pondThrowsTaken, setPondAwardMessage, setPondClosedMessage, setPondPrize, setPondThrows,
};
export type { PondPrizeArm, PondThrowArm };
