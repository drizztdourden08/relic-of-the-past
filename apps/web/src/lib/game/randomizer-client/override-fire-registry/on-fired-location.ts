/* @layer bridge-wasm @kind logic */
import { fireRegistryState } from './fire-registry-state';
import type { FiredLocationListener } from './override-fire-registry.type';

const onFiredLocation = (listener: FiredLocationListener): () => void => {
  fireRegistryState.firedListeners.add(listener);
  return () => fireRegistryState.firedListeners.delete(listener);
};

export { onFiredLocation };
