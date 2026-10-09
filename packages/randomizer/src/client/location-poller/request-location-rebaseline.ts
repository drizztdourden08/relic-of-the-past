/* @layer bridge-wasm @kind logic */
import { pollerState } from './poller-state';

const requestLocationRebaseline = (): void => {
  pollerState.rebaselinePending = true;
};

export { requestLocationRebaseline };
