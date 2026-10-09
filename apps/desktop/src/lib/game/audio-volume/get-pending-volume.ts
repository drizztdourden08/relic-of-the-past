/* @layer bridge-wasm @kind logic */
import { volumeState } from './volume-state';

const getPendingVolume = (): number | null => volumeState.pendingVolume;

export { getPendingVolume };
