/* @layer renderer-lib @kind logic */
import type { MsuDebugListener } from './debug-bus.type';
import { debugListeners } from './debug-listeners';

const subscribeMsuDebug = (listener: MsuDebugListener): (() => void) => {
  debugListeners.add(listener);
  return () => { debugListeners.delete(listener); };
};

export { subscribeMsuDebug };
