/* @layer bridge-wasm @kind logic */
import { enqueue } from '../delivery-queue';
import { isCoreReady } from '@rotp/game-core';
import { isGrantable } from './is-grantable';
import { itemLabel } from '@rotp/randomizer';
import type { DeliverCheckParams } from './deliver-check.type';

const deliverCheck = (params: DeliverCheckParams): string | null => {
  const { roomId, chestIndex, itemId, message, source = 'randomizer' } = params;
  if (!isGrantable(itemId) || !isCoreReady()) return null;
  return enqueue(message ?? itemLabel(itemId), source, { type: 'trigger_check', roomId, chestIndex, itemId });
};

export { deliverCheck };
