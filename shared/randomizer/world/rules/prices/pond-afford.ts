/* @layer shared-game @kind logic */
import { seedRef } from '../rule-node-build';
import { seedKey } from '../seeded-price';
import { helperRule } from '../combinators';
import type { LocationKey } from '../../location-key.type';
import type { Rule } from '../../world.type';

const pondAfford = (key: LocationKey): Rule => helperRule('walletAtLeast', seedRef(seedKey.pondPrice(key)));

export { pondAfford };
