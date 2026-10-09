/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setPrizeShuffleActive = (on: boolean): void => setSessionGate('prizeShuffle', on);

export { setPrizeShuffleActive };
