/* @layer bridge-wasm @kind logic */
/**
 * Non-cheat entry points for the delivery queue.
 * Used by randomizer, networking, and other systems that need to give items.
 */

import { enqueue } from './delivery-queue';
import type { DeliveryAction } from './delivery-queue';
import { getGameState, getModule } from './wasm-bridge';
import { armReceiptGates } from './receipt-grants';
import { getItemByGameId, isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { receiptJumpText } from './receipt-jump-text';
import { isQuietReceiptItem } from './quiet-receipts';

// A virtual upgrade id has no record: its label is the jump it performs.
const itemName = (itemId: number): string => getItemByGameId({ receiveItemId: itemId })?.name
  ?? receiptJumpText(itemId) ?? `Unknown Item #${itemId}`;

const isReady = (): boolean => {
  return getGameState().status === 'running' && getModule() != null;
};

// The core's grant tables hold 76 entries; an id past them is silently dropped
// (or worse, reads out of bounds), so a delivery carrying one is refused here.
const isGrantable = (itemId: number): boolean => {
  if (isGrantableReceiveId(itemId)) return true;
  log.error(`[Delivery] Refused item id 0x${itemId.toString(16)}: outside the native grant table`);
  return false;
};

/**
 * |onComplete| runs once the core has finished handing the item over, for work that must follow the
 * pickup without sitting behind it as a second queue entry the player can see. The queue also fires
 * it for an entry it DROPS (clear() on a session stop), so a caller that must tell the two apart
 * checks something of its own. |onGranted| runs only when the core confirmed the grant, never
 * for a refused attempt or a dropped entry (delivery-queue.type.ts). |messageId| as a function is
 * asked for the id when the entry reaches the front of the queue, never at enqueue.
 */
const deliverItem = (
  itemId: number, message?: string, source = 'randomizer', messageId?: number | (() => number),
  onComplete?: () => void, onGranted?: () => void,
): string | null => {
  if (!isGrantable(itemId) || !isReady()) return null;
  // Sessions arm the receipt gates at start (receipt-grants.ts); arming again at enqueue
  // covers grants fired outside a session, and the WRAM latch (next frame) still lands
  // before the queue's readiness poll can execute, the arm-with-the-write pattern.
  armReceiptGates();
  const action: DeliveryAction = typeof messageId === 'function'
    ? { type: 'give_item', itemId, receiptExport: true, messageOf: messageId }
    : { type: 'give_item', itemId, receiptExport: true, messageId };
  const label = message ?? itemName(itemId);
  // Quiet receipts: a randomizer rupee, bomb or arrow skips its hold-up and message.
  if (source === 'randomizer' && isQuietReceiptItem(itemId)) {
    return enqueue(label, source, { type: 'quiet_receipt', itemId, fallback: action }, onComplete, onGranted);
  }
  return enqueue(label, source, action, onComplete, onGranted);
};

const deliverCheck = (roomId: number, chestIndex: number, itemId: number, message?: string, source = 'randomizer'): string | null => {
  if (!isGrantable(itemId) || !isReady()) return null;
  const action: DeliveryAction = { type: 'trigger_check', roomId, chestIndex, itemId };
  const label = message ?? itemName(itemId);
  return enqueue(label, source, action);
};

const deliverNpcCheck = (flagType: number, flagMask: number, itemId: number, spriteType: number, postGfx: number, message?: string, source = 'randomizer', messageId?: number): string | null => {
  if (!isGrantable(itemId) || !isReady()) return null;
  // assigned: itemId here is the session's final answer for the check, never the
  // giver's vanilla item, so the npc-override seam must not re-substitute it.
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx, assigned: true, messageId };
  const label = message ?? itemName(itemId);
  return enqueue(label, source, action);
};

const deliverCustom = (execute: () => void, message: string, source: string): string | null => {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'custom', execute };
  return enqueue(message, source, action);
};

export { deliverItem, deliverCheck, deliverNpcCheck, deliverCustom };
