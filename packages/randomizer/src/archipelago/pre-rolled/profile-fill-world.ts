/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { createRng } from '../../rng';
import { buildFillWorld } from '../../world/fill/fill-world';
import { fillOptionsFromSnapshot } from '../../world/fill/fill-options-from-snapshot';
import { rollPrices } from '../../world/fill/roll-placement-prices';
import { pondDemandsOfSnapshot } from '../../world/fill/pond-demands-of-snapshot';
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { FillWorld } from '../../world/fill/fill-world.type';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';

const profileFillWorld = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets = {},
): FillWorld => {
  const pondDemands = pondDemandsOfSnapshot(snapshot, seed, deliverable);
  const rng = createRng(seed);
  const fillOptions = fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => itemAt(choices, rng.int(choices.length)),
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => itemAt(choices, rng.int(choices.length)),
  }, seed);
  const shopPrices = rollPrices({ values: snapshot.values, options: fillOptions, rng });
  return buildFillWorld({ ...fillOptions, shopPrices, pondDemands });
};

export { profileFillWorld };
