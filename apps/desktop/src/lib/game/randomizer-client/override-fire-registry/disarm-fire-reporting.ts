/* @layer bridge-wasm @kind logic */
import { disarmOverrideFiredEvents } from '../../override-fired';
import { fireRegistryState } from './fire-registry-state';

const disarmFireReporting = (): void => {
  disarmOverrideFiredEvents();
  fireRegistryState.locationByFireId.clear();
  fireRegistryState.armedCheckIds.clear();
  fireRegistryState.fired.clear();
  fireRegistryState.firedLocationKeys.clear();
  fireRegistryState.nextFireId = 0;
};

export { disarmFireReporting };
