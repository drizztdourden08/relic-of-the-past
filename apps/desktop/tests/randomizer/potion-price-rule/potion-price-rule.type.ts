/* @layer tests @kind type */
import type { OptionValue, ShopScope } from '@rotp/randomizer';

type Values = Readonly<Record<string, OptionValue>>;

interface Combination { scope: ShopScope; prices: Values }

export type { Combination, Values };
