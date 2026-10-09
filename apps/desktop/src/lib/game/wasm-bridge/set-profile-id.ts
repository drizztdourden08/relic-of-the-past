/* @layer bridge-wasm @kind logic */
import { bridgeState } from './bridge-state';

const setProfileId = (id: string | null): void => { bridgeState.currentProfileId = id; };

export { setProfileId };
