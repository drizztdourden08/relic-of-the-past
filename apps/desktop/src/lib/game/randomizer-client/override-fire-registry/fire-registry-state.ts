/* @layer bridge-wasm @kind logic */
import type { FireRegistryState } from './override-fire-registry.type';

const fireRegistryState: FireRegistryState = {
  locationByFireId: new Map(),
  armedCheckIds: new Set(),
  fired: new Set(),
  firedLocationKeys: new Set(),
  firedListeners: new Set(),
  nextFireId: 0,
};

export { fireRegistryState };
