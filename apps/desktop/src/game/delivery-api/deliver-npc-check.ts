/* @layer bridge-wasm @kind logic */
import { enqueue } from '../delivery-queue';
import type { DeliveryAction } from '../delivery-queue';
import { isCoreReady } from '@rotp/game-core';
import { isGrantable } from './is-grantable';
import { itemLabel } from '@rotp/randomizer';
import type { DeliverNpcCheckParams } from './deliver-npc-check.type';

const deliverNpcCheck = (params: DeliverNpcCheckParams): string | null => {
  const { flagType, flagMask, itemId, spriteType, postGfx, message, source = 'randomizer', messageId } = params;
  if (!isGrantable(itemId) || !isCoreReady()) return null;
  const action: DeliveryAction = { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx, assigned: true, messageId };
  return enqueue({ message: message ?? itemLabel(itemId), source, action });
};

export { deliverNpcCheck };
