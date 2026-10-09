/* @layer bridge-wasm @kind logic */
import { bridgeState } from './bridge-state';

const getProfileId = (): string | null => bridgeState.currentProfileId;

export { getProfileId };
