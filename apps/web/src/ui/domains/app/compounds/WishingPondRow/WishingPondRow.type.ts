/* @layer renderer-components @kind types */
import type { CurveId } from '@shared/randomizer/ap-world/capacity';
import type { PondAskSetting } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { PondAskCurrency } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { ShopBottleContent } from '@shared/randomizer/ap-world/shops/shop-price.type';
import type { OptionDescription } from '@shared/randomizer/ap-world/option-description.type';
import type { PondMode } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { LadderPreviewProps } from '../LadderPreview';

/** The row's own shape of the pond setting: indexes and choices, never prices. */
interface PondRowState {
  mode: PondMode;
  /** Price-ladder indexes of the first and the final throw; first ≤ final. */
  range: readonly [number, number];
  throws: number;
  items: number;
  curve: CurveId | 'free';
  /** The free sequence, read while `curve` is 'free'. */
  jumps: readonly number[];
  /** What the fairy may ask for at each rung; the rupee row's ends are `range`. */
  ask: PondAskSetting;
}

/** One counted demand row: the tick, and the range its amount is drawn from. */
interface PondAskRowModel {
  currency: PondAskCurrency;
  label: string;
  checked: boolean;
  /** The amounts the thumbs sit on; absent for a row with no range to show. */
  stops?: readonly string[];
  /** [low, high] indexes into `stops`. */
  range?: readonly [number, number];
}

interface PondBottleRowModel {
  content: ShopBottleContent;
  label: string;
  checked: boolean;
}

/** Everything the ask block draws for one pond. */
interface PondAskModel {
  counted: readonly PondAskRowModel[];
  bottleChecked: boolean;
  /** How many bottles she may ask for: the amounts the two thumbs sit on. */
  bottleStops: readonly string[];
  /** [low, high] indexes into `bottleStops`. */
  bottleRange: readonly [number, number];
  bottleRows: readonly PondBottleRowModel[];
  itemChecked: boolean;
}

interface PondCurveOption {
  value: string;
  label: string;
}

/** Everything the row renders, derived from the setting by the view tier. */
interface PondRowModel {
  label: string;
  /** The mode in the player's words; the dropdown itself lives with the other choices. */
  modeLabel: string;
  /** A short line under the head, when the mode has one to say. */
  caption?: OptionDescription;
  state: PondRowState;
  /** The legal prices, formatted, in ladder order. */
  stops: readonly string[];
  curveOptions: readonly PondCurveOption[];
  maxThrows: number;
  maxItems: number;
  /** Custom alone lets the player set the prices. */
  hasPrices: boolean;
  /** Every mode but the legacy one carries pool items. */
  offersItems: boolean;
  preview: LadderPreviewProps;
  /** The demand rows, derived: what she may ask for and over what range. */
  askModel: PondAskModel;
  /** What the wallet must hold to reach the last prize; absent when the pond holds none. */
  walletNote?: string;
}

interface WishingPondRowProps {
  model: PondRowModel;
  /** The Run tab: every control disabled, the preview and readouts kept. */
  readOnly?: boolean;
  onChange?: (next: PondRowState) => void;
}

export type {
  PondAskModel, PondAskRowModel, PondBottleRowModel, PondCurveOption, PondRowModel, PondRowState,
  WishingPondRowProps,
};
