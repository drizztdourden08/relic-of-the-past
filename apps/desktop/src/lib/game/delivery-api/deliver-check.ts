/* @layer bridge-wasm @kind logic */
import { enqueue } from '../delivery-queue';
import { isCoreReady } from '@rotp/game-core';
import { isGrantable } from './is-grantable';
import { itemLabel } from '@rotp/randomizer';

const deliverCheck = (roomId: number, chestIndex: number, itemId: number, message?: string, source = 'randomizer'): string | null => {
  if (!isGrantable(itemId) || !isCoreReady()) return null;
  return enqueue(message ?? itemLabel(itemId), source, { type: 'trigger_check', roomId, chestIndex, itemId });
};

export { deliverCheck };
