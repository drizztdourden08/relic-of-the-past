/* @layer bridge-wasm @kind logic */
import type { ActiveCapacityListener } from './active-capacity-profile.type';
import { activeCapacityState } from './active-capacity-state';

const subscribeActiveCapacity = (listener: ActiveCapacityListener): (() => void) => {
  activeCapacityState.listeners.add(listener);
  return () => activeCapacityState.listeners.delete(listener);
};

export { subscribeActiveCapacity };
