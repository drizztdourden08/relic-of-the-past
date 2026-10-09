/* @layer renderer-lib @kind logic */
import type { MsuDebugEvent } from './debug-bus.type';
import { debugListeners } from './debug-listeners';

const publishMsuDebug = (event: MsuDebugEvent): void => {
  for (const listener of debugListeners) {
    try { listener(event); } catch { continue; }
  }
};

export { publishMsuDebug };
