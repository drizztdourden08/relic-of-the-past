/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { PRIZE_LOCATIONS, VANILLA_PRIZES } from '../scope-tables';
import type { Rng } from '../../rng';
import type { FillWorld } from './fill-world.type';

const placePrizes = (fillWorld: FillWorld, shufflePrizes: boolean, rng: Rng): void => {
  const { world, pool } = fillWorld;
  if (shufflePrizes) {
    const slots = rng.shuffle([...PRIZE_LOCATIONS]);
    slots.forEach((slot, index) => world.placedItems.set(slot, itemAt(pool.prizes, index)));
    return;
  }
  for (const [slot, prize] of VANILLA_PRIZES) world.placedItems.set(slot, prize);
};

export { placePrizes };
