/* @layer tests @kind helper */
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { BASE } from './potion-price-rule.constants';
import type { Combination, Values } from './potion-price-rule.type';

const valuesOf = ({ scope, prices }: Combination): Values =>
  buildOptionsSnapshot(randomizerChoiceOverrides({ ...BASE, shops: scope, shopPrices: prices })).values;

export { valuesOf };
