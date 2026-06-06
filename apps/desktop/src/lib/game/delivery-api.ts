/**
 * Delivery API — non-cheat entry points for the delivery queue.
 * Used by randomizer, networking, and other systems that need to give items.
 */

import { enqueue } from './delivery-queue';
import type { DeliveryAction } from './delivery-queue';
import { getGameState, getModule } from './wasm-bridge';
import { ITEM_ID_TO_NAME } from '@shared/game/items';

function isReady(): boolean {
  return getGameState().status === 'running' && getModule() != null;
}

/** Enqueue an item delivery from a randomizer source. */
function deliverItem(itemId: number, message?: string, source = 'randomizer'): string | null {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'give_item', itemId };
  const label = message ?? ITEM_ID_TO_NAME[itemId] ?? `Unknown Item #${itemId}`;
  return enqueue(label, source, action);
}

/** Enqueue a chest check delivery from a randomizer source. */
function deliverCheck(
  roomId: number, chestIndex: number, itemId: number,
  message?: string, source = 'randomizer'
): string | null {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'trigger_check', roomId, chestIndex, itemId };
  const label = message ?? ITEM_ID_TO_NAME[itemId] ?? `Unknown Item #${itemId}`;
  return enqueue(label, source, action);
}

/** Enqueue an NPC check delivery from a randomizer source. */
function deliverNpcCheck(
  flagType: number, flagMask: number, itemId: number,
  spriteType: number, postGfx: number,
  message?: string, source = 'randomizer'
): string | null {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx };
  const label = message ?? ITEM_ID_TO_NAME[itemId] ?? `Unknown Item #${itemId}`;
  return enqueue(label, source, action);
}

/** Enqueue a custom delivery action (for arbitrary effects). */
function deliverCustom(execute: () => void, message: string, source: string): string | null {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'custom', execute };
  return enqueue(message, source, action);
}

export { deliverItem, deliverCheck, deliverNpcCheck, deliverCustom };
