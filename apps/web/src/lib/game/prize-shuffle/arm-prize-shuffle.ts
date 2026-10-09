/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { setPrizeShuffleActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const armPrizeShuffle = (): void => {
  setPrizeShuffleActive(true);
  reassertGateWord3();
  log.randomizer('[Randomizer] Prize shuffle armed: boss rewards read the hook-owned claimed bit');
};

export { armPrizeShuffle };
