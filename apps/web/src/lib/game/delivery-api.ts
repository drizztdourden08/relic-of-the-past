/* @layer bridge-wasm @kind logic */
/**
 * Delivery API — non-cheat entry points for the delivery queue.
 * Used by randomizer, networking, and other systems that need to give items.
 */

import { enqueue } from './delivery-queue';
import type { DeliveryAction } from './delivery-queue';
import { getGameState, getModule } from './wasm-bridge';
import { getItemByGameId } from '@shared/game/data';

const itemName = (itemId: number): string => getItemByGameId({ receiveItemId: itemId })?.randomizerName ?? `Unknown Item #${itemId}`;

const isReady = (): boolean => {
  return getGameState().status === 'running' && getModule() != null;
};

const deliverItem = (itemId: number, message?: string, source = 'randomizer'): string | null => {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'give_item', itemId };
  const label = message ?? itemName(itemId);
  return enqueue(label, source, action);
};

const deliverCheck = (roomId: number, chestIndex: number, itemId: number, message?: string, source = 'randomizer'): string | null => {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'trigger_check', roomId, chestIndex, itemId };
  const label = message ?? itemName(itemId);
  return enqueue(label, source, action);
};

const deliverNpcCheck = (flagType: number, flagMask: number, itemId: number, spriteType: number, postGfx: number, message?: string, source = 'randomizer'): string | null => {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx };
  const label = message ?? itemName(itemId);
  return enqueue(label, source, action);
};

const deliverCustom = (execute: () => void, message: string, source: string): string | null => {
  if (!isReady()) return null;
  const action: DeliveryAction = { type: 'custom', execute };
  return enqueue(message, source, action);
};

export { deliverItem, deliverCheck, deliverNpcCheck, deliverCustom };
