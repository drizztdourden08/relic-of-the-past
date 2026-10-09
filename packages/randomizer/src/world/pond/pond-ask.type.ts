/* @layer shared-game @kind types */
import type { LocationKey } from '../location-key';
import type { ShopBottleContent, ShopCurrencySetting, ShopPrice } from '../shops/shop-price.type';

type PondAskCurrency = 'rupees' | 'bombs' | 'arrows';

interface PondBottleAsk extends ShopCurrencySetting {
  contents: readonly ShopBottleContent[];
}

type PondAskAmountKind = PondAskCurrency | 'bottle';

interface PondAskSetting {
  rupees: ShopCurrencySetting;
  bombs: ShopCurrencySetting;
  arrows: ShopCurrencySetting;
  bottle: PondBottleAsk;
  item: { enabled: boolean };
}

type PondDemandView = Readonly<Partial<Record<LocationKey, ShopPrice>>>;

export type { PondAskAmountKind, PondAskCurrency, PondAskSetting, PondBottleAsk, PondDemandView };
