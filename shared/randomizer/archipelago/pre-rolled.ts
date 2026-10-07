/* @layer shared-game @kind logic */
/**
 * The values a profile settles before any fill, rolled exactly as the local generator rolls
 * them on its first attempt (world/fill/generate.ts): the pond demands from the seed alone,
 * then one rng from the seed that rolls the shelf prices and makes the pool's picks, then the
 * fill world those values build. The player file carries all of it under `pre_rolled`, so the
 * world package places against the numbers the app shows and builds the same world.
 */
import { createRng } from '../rng';
import { buildFillWorld } from '../world/fill/fill-world';
import { fillOptionsFromSnapshot, shufflePrizesFromSnapshot } from '../world/fill/fill-options-from-snapshot';
import { rollPrices } from '../world/fill/roll-placement-prices';
import { pondDemandsOfSnapshot } from '../world/fill/pond-demands-of-snapshot';
import { worldModelOf } from './export/world-model';
import type { DeliverableSets } from '../world/fill/fill-options-from-snapshot';
import type { FillWorld } from '../world/fill/fill-world.type';
import type { RandomizerOptionsSnapshot } from '../world/options.type';
import type { CapacityProfile } from '../world/capacity/capacity-profile.type';
import type { PondDemandView } from '../world/pond/pond-ask.type';
import type { ShopPriceView } from '../world/shops/shop-price.type';
import type { WorldModel } from './export/export.type';

interface PreRolled {
  pondDemands: PondDemandView;
  shopPrices: ShopPriceView;
  capacity: CapacityProfile;
  /** The whole world the package builds (export/world-model.ts). */
  world: WorldModel;
}

/** The fill world a profile's seed builds before its first placement attempt. */
const profileFillWorld = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets = {},
): FillWorld => {
  const pondDemands = pondDemandsOfSnapshot(snapshot, seed, deliverable);
  const rng = createRng(seed);
  const fillOptions = fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => choices[rng.int(choices.length)],
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => choices[rng.int(choices.length)],
  }, seed);
  const shopPrices = rollPrices({ values: snapshot.values, options: fillOptions, rng });
  return buildFillWorld({ ...fillOptions, shopPrices, pondDemands });
};

const preRolledOfFillWorld = (fillWorld: FillWorld, snapshot: RandomizerOptionsSnapshot): PreRolled => ({
  pondDemands: fillWorld.world.options.pondDemands ?? {},
  shopPrices: fillWorld.shopPrices,
  capacity: fillWorld.capacity,
  world: worldModelOf({
    fillWorld, options: { ...snapshot.values }, shufflePrizes: shufflePrizesFromSnapshot(snapshot),
  }),
});

/** Everything the player file carries under `pre_rolled` for this seed and these options. */
const preRolledOfSnapshot = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets = {},
): PreRolled => preRolledOfFillWorld(profileFillWorld(seed, snapshot, deliverable), snapshot);

export { preRolledOfFillWorld, preRolledOfSnapshot, profileFillWorld };
export type { PreRolled };
