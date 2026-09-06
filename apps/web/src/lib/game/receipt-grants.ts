/* @layer bridge-wasm @kind logic */
/**
 * Receipt-grant bridge: JS-side entry points for the native receipt-flow exports
 * (core/game-hooks/receipt_grant.c). Item deliveries route through the delivery
 * queue ('give_item' actions execute WasmGrantItemWithReceipt); this file carries
 * the direct calls other systems need: capacity upgrades, and pre-arming a
 * contextual receipt message.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setReceiptGrantsActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

/**
 * Arm the receipt gate pair. receiptGrantsActive drives BOTH kFeatures3_ReceiptExport
 * and kFeatures3_ReceiptMessages in the gate word (live-settings-flags.ts). The setter
 * only records; reassertGateWord3 pushes the word, which latches into WRAM a frame
 * later (SyncGateWords), the record-in-setter contract the item-override arming uses.
 * Randomizer sessions call this at START, not at first enqueue: a chest-override grant
 * runs fully natively (no delivery ever enqueued), so its contextual message gate must
 * already be open when the first chest opens. The delivery path still arms at enqueue
 * as belt-and-suspenders for grants fired outside a session.
 */
const armReceiptGates = (): void => {
  setReceiptGrantsActive(true);
  reassertGateWord3();
};

/** Close the receipt gate pair at session stop, mirroring clearItemOverrides. */
const disarmReceiptGates = (): void => {
  setReceiptGrantsActive(false);
  reassertGateWord3();
};

/**
 * Grant capacity-upgrade steps the way the upgrade pond does (kind 0 = bombs,
 * 1 = arrows; each step is one pond level). Arms the receipt gate alongside the
 * call, which latches into WRAM a frame later, so callers should route through the
 * delivery queue (deliverCustom) instead of calling in the same burst that
 * starts a session. Gated by kFeatures3_ReceiptExport in the core.
 */
const grantCapacityUpgrade = (kind: 0 | 1, amount: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] grantCapacityUpgrade called with no active module');
    return;
  }
  armReceiptGates();
  mod.ccall('WasmGrantCapacityUpgrade', null, ['number', 'number'], [kind, amount]);
  log.randomizer(`[Randomizer] Capacity upgrade requested: kind=${kind} amount=${amount}`);
};

/**
 * Arm the one-shot contextual message for the NEXT receipt that finishes
 * (RANDOMIZER_RECEIPT_MSG ids). Records unconditionally; the core applies it only
 * while kFeatures3_ReceiptMessages is open. Queue-routed deliveries should pass
 * `messageId` on the action instead. This direct form is for grants that fire
 * outside the queue.
 */
const armNextReceiptMessage = (messageId: number): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmSetNextReceiptMessage', null, ['number'], [messageId]);
};

export { armNextReceiptMessage, armReceiptGates, disarmReceiptGates, grantCapacityUpgrade };
