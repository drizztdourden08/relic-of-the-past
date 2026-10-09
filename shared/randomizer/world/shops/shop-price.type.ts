/* @layer shared-game @kind types */
import type { LocationKey } from '../location-key';

type ShopCountedCurrency = 'rupees' | 'arrows' | 'bombs' | 'hearts';

type ShopBottleContent = 'fairy' | 'bee' | 'red-potion' | 'blue-potion' | 'green-potion';

type ShopCurrency = ShopCountedCurrency | 'bottle' | 'item';

interface ShopCountedPrice {
  currency: ShopCountedCurrency;
  amount: number;
}

interface ShopBottlePrice {
  currency: 'bottle';
  content: ShopBottleContent;
  amount?: number;
}

interface ShopItemPrice {
  currency: 'item';
  itemName: string;
}

type ShopPrice = ShopCountedPrice | ShopBottlePrice | ShopItemPrice;

interface ShopCurrencySetting {
  enabled: boolean;
  min: number;
  max: number;
}

interface ShopPricePlan {
  rupees: ShopCurrencySetting;
  arrows: ShopCurrencySetting;
  bombs: ShopCurrencySetting;
  hearts: ShopCurrencySetting;
  bottle: { enabled: boolean; contents: readonly ShopBottleContent[] };
  heartCeiling: number;
}

type ShopPriceView = Readonly<Partial<Record<LocationKey, ShopPrice>>>;

interface NativePrice {
  currency: number;
  amount: number;
}

interface CurrencyRow {
  currency: ShopCountedCurrency;
  label: string;
  max: number;
  defaultMin: number;
  defaultMax: number;
}

interface BottleContentRow {
  content: ShopBottleContent;
  label: string;
}

export type {
  BottleContentRow, CurrencyRow, NativePrice, ShopBottleContent, ShopBottlePrice, ShopCountedCurrency, ShopCountedPrice,
  ShopCurrency, ShopCurrencySetting, ShopItemPrice, ShopPrice, ShopPricePlan, ShopPriceView,
};
