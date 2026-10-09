/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { CurveId } from '@shared/randomizer/world/capacity';
import type { PondAskSetting } from '@shared/randomizer/world/pond/pond-ask.type';
import type { PondAskCurrency } from '@shared/randomizer/world/pond/pond-ask.type';
import type { ShopBottleContent } from '@shared/randomizer/world/shops/shop-price.type';
import type { OptionDescription } from '@shared/randomizer/world/option-description.type';
import type { PondMode } from '@shared/randomizer/world/pond/pond-profile.type';
import type { LadderPreviewProps } from '../LadderPreview';

interface PondRowState {
  mode: PondMode;
  range: readonly [number, number];
  throws: number;
  items: number;
  curve: CurveId | 'free';
  jumps: readonly number[];
  ask: PondAskSetting;
}

interface PondAskRowModel {
  currency: PondAskCurrency;
  label: string;
  checked: boolean;
  stops?: readonly string[];
  range?: readonly [number, number];
}

interface PondBottleRowModel {
  content: ShopBottleContent;
  label: string;
  checked: boolean;
}

interface PondAskModel {
  counted: readonly PondAskRowModel[];
  bottleChecked: boolean;
  bottleStops: readonly string[];
  bottleRange: readonly [number, number];
  bottleRows: readonly PondBottleRowModel[];
  itemChecked: boolean;
}

interface PondCurveOption {
  value: string;
  label: string;
}

interface PondRowModel {
  label: string;
  modeLabel: string;
  caption?: OptionDescription;
  state: PondRowState;
  stops: readonly string[];
  curveOptions: readonly PondCurveOption[];
  maxThrows: number;
  maxItems: number;
  hasPrices: boolean;
  offersItems: boolean;
  preview: LadderPreviewProps;
  askModel: PondAskModel;
  walletNote?: string;
}

interface WishingPondRowProps {
  model: PondRowModel;
  readOnly?: boolean;
  readout?: boolean;
  onChange?: (next: PondRowState) => void;
}

interface PondControlsProps {
  model: PondRowModel;
  readOnly: boolean;
  readout?: boolean;
  onChange: (part: Partial<PondRowState>) => void;
}

interface PondOptionLineProps {
  label: string;
  children: ReactNode;
}

export type {
  PondAskModel, PondAskRowModel, PondBottleRowModel, PondControlsProps, PondCurveOption, PondOptionLineProps,
  PondRowModel, PondRowState, WishingPondRowProps,
};
