/* @layer shared-game @kind logic */
import { shufflePrizesFromSnapshot } from '../../world/fill/fill-options-from-snapshot';
import { worldModelOf } from '../export/world-model';
import type { FillWorld } from '../../world/fill/fill-world.type';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';
import type { PreRolled } from './pre-rolled.type';

const preRolledOfFillWorld = (fillWorld: FillWorld, snapshot: RandomizerOptionsSnapshot): PreRolled => ({
  pondDemands: fillWorld.world.options.pondDemands ?? {},
  shopPrices: fillWorld.shopPrices,
  capacity: fillWorld.capacity,
  world: worldModelOf({
    fillWorld, options: { ...snapshot.values }, shufflePrizes: shufflePrizesFromSnapshot(snapshot),
  }),
});

export { preRolledOfFillWorld };
