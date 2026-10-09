/* @layer bridge-wasm @kind logic */
import { setPrizeShuffleActive, reassertGateWord3 } from '@rotp/game-core';

const disarmPrizeShuffle = (): void => {
  setPrizeShuffleActive(false);
  reassertGateWord3();
};

export { disarmPrizeShuffle };
