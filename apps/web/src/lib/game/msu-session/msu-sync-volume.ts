/* @layer bridge-wasm @kind logic */
import { msuSessionState } from './msu-session-state';

const msuSyncVolume = (): void => {
  msuSessionState.engine?.syncVolume();
};

export { msuSyncVolume };
