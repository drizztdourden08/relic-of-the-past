/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { OptionValue } from '@rotp/randomizer';
import type { ShopBottleContent, ShopCountedCurrency } from '@rotp/randomizer';

interface CurrencyCatalogKeys {
  keyOf: (currency: ShopCountedCurrency) => string;
  minKeyOf: (currency: ShopCountedCurrency) => string;
  maxKeyOf: (currency: ShopCountedCurrency) => string;
}

interface BottleContentRowModel {
  content: ShopBottleContent;
  label: string;
  key: string;
  checked: boolean;
  blocked: boolean;
  note: string;
}

interface CurrencyPriceRowProps {
  label: string;
  enabled: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  blocked?: boolean;
  note?: string;
  stops?: readonly string[];
  range?: readonly [number, number];
  onRangeChange?: (next: [number, number]) => void;
  readout?: boolean;
  children?: ReactNode;
}

interface BottleContentRowProps {
  row: BottleContentRowModel;
  disabled: boolean;
  readout?: boolean;
  onChange?: (checked: boolean) => void;
}

type Values = Readonly<Record<string, OptionValue>>;

interface CurrencyRowModel {
  currency: ShopCountedCurrency;
  label: string;
  key: string;
  minKey: string;
  maxKey: string;
  checked: boolean;
  blocked: boolean;
  note: string;
  ceiling: number;
  stops: readonly string[];
  range: readonly [number, number];
}

export type {
  BottleContentRowModel, BottleContentRowProps, CurrencyCatalogKeys, CurrencyPriceRowProps, CurrencyRowModel, Values,
};
