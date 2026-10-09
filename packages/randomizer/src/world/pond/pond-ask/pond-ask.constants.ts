/* @layer shared-game @kind constants */
import { POND_ASK_ROWS, POND_BOTTLE_ROW } from './pond-ask-rows.constants';
import type { PondAskAmountKind, PondAskCurrency } from '../pond-ask.type';
import type { PondAskRow, PondCurrencyRow } from '../pond.type';

const POND_ASK_ROW_BY_CURRENCY: Readonly<Record<PondAskCurrency, PondCurrencyRow>> = Object.fromEntries(
  POND_ASK_ROWS.map((row) => [row.currency, row]),
) as Readonly<Record<PondAskCurrency, PondCurrencyRow>>;

const POND_ASK_ROW_BY_KIND: Readonly<Record<PondAskAmountKind, PondAskRow>> = {
  ...POND_ASK_ROW_BY_CURRENCY, bottle: POND_BOTTLE_ROW,
};

export { POND_ASK_ROW_BY_CURRENCY, POND_ASK_ROW_BY_KIND };
