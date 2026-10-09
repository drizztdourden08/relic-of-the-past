/* @layer bridge-wasm @kind logic */
import { wasmReadFlagSnapshot } from './bridge/sim-queries/wasm-read-flag-snapshot';
import { FOLLOWER_SLOT, TAGALONG_NONE, TAGALONG_PRINCESS } from './follower-state.constants';

const currentFollower = (): number => wasmReadFlagSnapshot()?.progress[FOLLOWER_SLOT] ?? TAGALONG_NONE;

const isFollowerActive = (): boolean => currentFollower() === TAGALONG_PRINCESS;

export { isFollowerActive };
