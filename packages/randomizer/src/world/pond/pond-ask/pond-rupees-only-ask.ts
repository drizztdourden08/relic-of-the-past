/* @layer shared-game @kind logic */
import { POND_ASK_BOTTLE_CONTENTS } from './pond-ask-rows.constants';
import { POND_ASK_ROW_BY_KIND } from './pond-ask.constants';
import type { PondAskAmountKind, PondAskSetting } from '../pond-ask.type';
import type { ShopCurrencySetting } from '../../shops/shop-price.type';

const offRow = (kind: PondAskAmountKind): ShopCurrencySetting => {
  const { defaultMin, defaultMax } = POND_ASK_ROW_BY_KIND[kind];
  return { enabled: false, min: defaultMin, max: defaultMax };
};

const pondRupeesOnlyAsk = (min: number, max: number): PondAskSetting => ({
  rupees: { enabled: true, min, max },
  bombs: offRow('bombs'),
  arrows: offRow('arrows'),
  bottle: { ...offRow('bottle'), contents: POND_ASK_BOTTLE_CONTENTS.map(({ content }) => content) },
  item: { enabled: false },
});

export { pondRupeesOnlyAsk };
