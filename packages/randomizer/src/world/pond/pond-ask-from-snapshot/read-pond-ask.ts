/* @layer shared-game @kind logic */
import { POND_ASK_BOTTLE_CONTENTS } from '../pond-ask';
import {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf,
} from '../pond-ask-keys';
import { askRangeOf } from './ask-range-of';
import type { PartialOptionValues } from '../../options.type';
import type { PondAskCurrency, PondAskSetting } from '../pond-ask.type';
import type { PondInstance } from '../pond-instance.type';
import type { RupeeEnds } from '../pond.type';
import type { ShopCurrencySetting } from '../../shops/shop-price.type';

const countedRowOf = (
  values: PartialOptionValues, pond: PondInstance, currency: PondAskCurrency,
): ShopCurrencySetting => ({
  enabled: values[pondAskKeyOf(pond, currency)] === true,
  ...askRangeOf(values, pond, currency),
});

const readPondAsk = (values: PartialOptionValues, pond: PondInstance, ladder: RupeeEnds): PondAskSetting => ({
  rupees: { enabled: values[pondAskKeyOf(pond, 'rupees')] !== false, min: ladder.min, max: ladder.max },
  bombs: countedRowOf(values, pond, 'bombs'),
  arrows: countedRowOf(values, pond, 'arrows'),
  bottle: {
    enabled: values[pondAskBottleKeyOf(pond)] === true,
    ...askRangeOf(values, pond, 'bottle'),
    contents: POND_ASK_BOTTLE_CONTENTS
      .filter(({ content }) => values[pondAskBottleContentKeyOf(pond, content)] !== false)
      .map(({ content }) => content),
  },
  item: { enabled: values[pondAskItemKeyOf(pond)] === true },
});

export { readPondAsk };
