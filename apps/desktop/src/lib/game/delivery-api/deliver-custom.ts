/* @layer bridge-wasm @kind logic */
import { enqueue } from '../delivery-queue';
import { isCoreReady } from '@rotp/game-core';

const deliverCustom = (execute: () => void, message: string, source: string): string | null => {
  if (!isCoreReady()) return null;
  return enqueue(message, source, { type: 'custom', execute });
};

export { deliverCustom };
