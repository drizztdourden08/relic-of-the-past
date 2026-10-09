/* @layer tests @kind type */
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';

type Values = Readonly<Record<string, OptionValue>>;

interface Combination { scope: ShopScope; prices: Values }

export type { Combination, Values };
