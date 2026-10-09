/* @layer renderer-lib @kind logic */
import type { MsuDebugListener } from './debug-bus.type';

const debugListeners = new Set<MsuDebugListener>();

export { debugListeners };
