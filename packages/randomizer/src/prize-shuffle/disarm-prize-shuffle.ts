/* @layer bridge-wasm @kind logic */
import { setPrizeShuffleActive } from '@rotp/game-core';
import { reassertGateWord3 } from '@rotp/game-core';

const disarmPrizeShuffle = (): void => {
  setPrizeShuffleActive(false);
  reassertGateWord3();
};

export { disarmPrizeShuffle };
