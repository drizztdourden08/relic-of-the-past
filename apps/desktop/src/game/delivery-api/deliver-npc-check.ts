/* @layer bridge-wasm @kind logic */
import { enqueue } from '../delivery-queue';
import type { DeliveryAction } from '../delivery-queue';
import { isCoreReady } from '@rotp/game-core';
import { isGrantable } from './is-grantable';
import { itemLabel } from '@rotp/randomizer';

const deliverNpcCheck = (flagType: number, flagMask: number, itemId: number, spriteType: number, postGfx: number, message?: string, source = 'randomizer', messageId?: number): string | null => {
  if (!isGrantable(itemId) || !isCoreReady()) return null;
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx, assigned: true, messageId };
  return enqueue(message ?? itemLabel(itemId), source, action);
};

export { deliverNpcCheck };
