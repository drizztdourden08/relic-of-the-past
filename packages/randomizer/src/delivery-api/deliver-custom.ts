/* @layer bridge-wasm @kind logic */
import { enqueue } from '../delivery-queue/enqueue';
import { isCoreReady } from '@rotp/game-core';

const deliverCustom = (execute: () => void, message: string, source: string): string | null => {
  if (!isCoreReady()) return null;
  return enqueue({ message, source, action: { type: 'custom', execute } });
};

export { deliverCustom };
