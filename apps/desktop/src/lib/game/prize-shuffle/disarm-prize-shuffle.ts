/* @layer bridge-wasm @kind logic */
import { setPrizeShuffleActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const disarmPrizeShuffle = (): void => {
  setPrizeShuffleActive(false);
  reassertGateWord3();
};

export { disarmPrizeShuffle };
