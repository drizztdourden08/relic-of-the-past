/* @layer bridge-wasm @kind logic */
/**
 * Delivery action execution: the one place a queued delivery reaches the core.
 * Split from delivery-queue.ts so the queue file stays within the size policy and
 * the execute/refuse contract has a single home.
 */

import { getModule } from './wasm-bridge';
import type { DeliveryAction, DeliveryEntry } from './delivery-queue.type';

/**
 * 'done': the action fired (for receipt grants, the core confirmed the grant).
 * 'refused': the receipt export reported status 0, NOTHING was granted (gate not
 * latched yet, or the player cannot receive despite the readiness probe). The queue
 * must retry such an entry, never complete it.
 * 'settled': granted with nothing left to show (a quiet receipt), so the entry completes at once
 * instead of waiting for a pickup the game never runs.
 */
type ExecuteOutcome = 'done' | 'refused' | 'settled';

/** A receipt-flow grant, the only action the core can refuse synchronously. */
const isReceiptGrant = (action: DeliveryAction): boolean =>
  action.type === 'give_item' && action.receiptExport === true;

const executeAction = (action: DeliveryAction): ExecuteOutcome => {
  const mod = getModule();
  if (!mod) return isReceiptGrant(action) || action.type === 'quiet_receipt' ? 'refused' : 'done';

  switch (action.type) {
    case 'quiet_receipt': {
      // 1 granted, 0 not now (retried), 2 not quiet here: the ordinary receipt runs in its place.
      const status = mod.ccall('WasmGrantQuietReceipt', 'number', ['number'], [action.itemId]);
      if (status === 2) return executeAction(action.fallback);
      return status === 1 ? 'settled' : 'refused';
    }
    case 'give_item':
      // Randomizer deliveries (receiptExport) run the native receipt flow: hold-up +
      // message + inventory, gated by kFeatures3_ReceiptExport. The cheats UI and the
      // simulator keep the cheat export and its cheat/sim gates. The one-shot message
      // must be armed HERE, at execute time, not at enqueue: the queue may hold several
      // entries and the slot is consumed by whichever receipt finishes next. Re-arming
      // on a retry just records the same id again, because the setter only records.
      if (action.receiptExport) {
        const messageId = action.messageOf?.() ?? action.messageId;
        if (messageId !== undefined) {
          mod.ccall('WasmSetNextReceiptMessage', null, ['number'], [messageId]);
        }
        // Status 1 = granted, 0 = refused (receipt_grant.c). A pre-status WASM build
        // returns undefined from the void export; treat that as the old fire-and-forget
        // behavior instead of retrying a grant that may well have fired.
        const status = mod.ccall('WasmGrantItemWithReceipt', 'number', ['number'], [action.itemId]);
        return status === 0 ? 'refused' : 'done';
      }
      mod.ccall('WasmCheatGiveItem', null, ['number'], [action.itemId]);
      return 'done';
    case 'trigger_check':
      mod.ccall('WasmTriggerCheck', null, ['number', 'number', 'number'],
        [action.roomId, action.chestIndex, action.itemId]);
      return 'done';
    case 'trigger_npc_check':
      // Arm the one-shot contextual message at execute time, exactly like give_item.
      // A heart piece is skipped: a non-wrapping piece never crosses the message
      // seam, and the stale arm would leak into the next unrelated receipt.
      if (action.messageId !== undefined && action.itemId !== 0x17) {
        mod.ccall('WasmSetNextReceiptMessage', null, ['number'], [action.messageId]);
      }
      // The Assigned form bypasses the core's npc-override seam: the queued item is
      // already the host's final answer for the check. The plain form replays the
      // giver's vanilla grant, which an armed npc-override table may substitute.
      mod.ccall(action.assigned === true ? 'WasmTriggerNpcCheckAssigned' : 'WasmTriggerNpcCheck',
        null, ['number', 'number', 'number', 'number', 'number'],
        [action.flagType, action.flagMask, action.itemId, action.spriteType, action.postGfx]);
      return 'done';
    case 'custom':
      action.execute();
      return 'done';
  }
};

/** Executes a queued entry; a confirmed grant (never a refused one) fires its onGranted. */
const executeEntry = (entry: DeliveryEntry): ExecuteOutcome => {
  const outcome = executeAction(entry.action);
  if (outcome !== 'refused') {
    try { entry.onGranted?.(); } catch { /* a bad listener never stalls the queue */ }
  }
  return outcome;
};

export { executeAction, executeEntry, isReceiptGrant };
export type { ExecuteOutcome };
