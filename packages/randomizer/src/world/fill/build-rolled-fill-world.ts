/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { buildFillWorld } from './fill-world';
import { fillOptionsFromSnapshot } from './fill-options-from-snapshot';
import { rollPrices } from './roll-placement-prices';
import type { BuildRolledFillWorldInput, RolledFillWorld } from './build-rolled-fill-world.type';

const buildRolledFillWorld = ({
  seed, rng, snapshot, deliverable, pondDemands,
}: BuildRolledFillWorldInput): RolledFillWorld => {
  const fillOptions = fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => itemAt(choices, rng.int(choices.length)),
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => itemAt(choices, rng.int(choices.length)),
  }, seed);
  const shopPrices = rollPrices({ values: snapshot.values, options: fillOptions, rng });
  return { shopPrices, fillWorld: buildFillWorld({ ...fillOptions, shopPrices, pondDemands }) };
};

export { buildRolledFillWorld };
