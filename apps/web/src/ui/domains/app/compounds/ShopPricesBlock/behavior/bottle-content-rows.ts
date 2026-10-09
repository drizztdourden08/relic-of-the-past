/* @layer renderer-components @kind logic */
import {
  BOTTLE_CONTENTS, bottleContentKeyOf,
} from '@shared/randomizer/world/shops/shop-price-options.data';
import { blockedContentNote, potionPriceStateOfValues } from '@shared/randomizer/world/potion-price';
import type { BottleContentRowModel } from '../../CurrencyPriceRow';
import type { Values } from './bottle-content-rows.type';

const bottleContentRowsOf = (values: Values): readonly BottleContentRowModel[] => {
  const { blockedKeys } = potionPriceStateOfValues(values);
  return BOTTLE_CONTENTS.map(({ content, label }) => {
    const key = bottleContentKeyOf(content);
    const blocked = blockedKeys.has(key);
    return { content, label, key, checked: values[key] !== false, blocked, note: blocked ? blockedContentNote(label) : '' };
  });
};

export { bottleContentRowsOf };
