/* @layer shared-game @kind data */
import { BOTTLE_CONTENTS } from '../../shops/shop-price-options.data';
import { POND_PRICE_LADDER, POND_VANILLA_WALLET_TOP } from '../pond-ladder.data';
import type { PondAskRow, PondCurrencyRow } from '../pond.type';

const POND_BOMB_STOPS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 50];

const POND_ARROW_STOPS: readonly number[] = [1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70];

const POND_BOTTLE_STOPS: readonly number[] = [1, 2, 3, 4];

const POND_ASK_ROWS: readonly PondCurrencyRow[] = [
  {
    currency: 'rupees',
    label: 'Rupees',
    stops: POND_PRICE_LADDER,
    defaultMin: POND_PRICE_LADDER[0],
    defaultMax: POND_VANILLA_WALLET_TOP,
  },
  { currency: 'bombs', label: 'Bombs', stops: POND_BOMB_STOPS, defaultMin: 1, defaultMax: 5 },
  { currency: 'arrows', label: 'Arrows', stops: POND_ARROW_STOPS, defaultMin: 1, defaultMax: 10 },
];

const POND_BOTTLE_ROW: PondAskRow = {
  currency: 'bottle', label: 'Bottles', stops: POND_BOTTLE_STOPS, defaultMin: 1, defaultMax: 1,
};

const POND_ASK_BOTTLE_CONTENTS = BOTTLE_CONTENTS;

export {
  POND_ARROW_STOPS, POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_BOMB_STOPS, POND_BOTTLE_ROW, POND_BOTTLE_STOPS,
};
