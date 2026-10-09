/* @layer shared-game @kind constants */
import { CANONICAL_SLOTS } from '../shop-slot-facts';
import { MAX_SHOP_SLOT_DEPTH, MIN_SHOP_SLOT_DEPTH } from '../shop-slots';
import { SHOP_SHUFFLE_MODES } from '../shop-scope';
import {
  DEFAULT_SHOP_SHUFFLE_MODE, DEFAULT_SHOP_SLOT_DEPTH, SHOP_MODE_KEY, SHOP_MODE_LABELS, SHOP_SLOT_COUNT_KEY,
  SHOP_SLOT_DEPTH_KEY,
} from './shop-slot-options.data';
import { isShopOnByDefault } from './is-shop-on-by-default';
import { shopSlotDescriptionOf } from './shop-slot-description-of';
import { shopSlotKeyOf } from './shop-slot-key-of';
import { shopSlotLabelOf } from './shop-slot-label-of';
import { shopSlotToggleSeed } from './shop-slot-toggle-seed';
import type { OptionSeed } from '../../options.type';
import type { ShopSlotRow } from '../shop-slot.type';

const SHOP_SLOT_ROWS: readonly ShopSlotRow[] = CANONICAL_SLOTS.map((slot) => ({
  slot,
  key: shopSlotKeyOf(slot),
  label: shopSlotLabelOf(slot),
  defaultOn: isShopOnByDefault(slot),
  canonicalIndex: slot.canonicalIndex,
}));

const SHOP_MODE_SEED: OptionSeed = {
  key: SHOP_MODE_KEY,
  displayName: 'Shop Shuffle',
  group: 'shops',
  kind: 'choice',
  implementation: 'active',
  choices: SHOP_SHUFFLE_MODES.map((mode) => ({ value: mode, sourceValue: mode, label: SHOP_MODE_LABELS[mode] })),
  sourceDefault: DEFAULT_SHOP_SHUFFLE_MODE,
  baseline: DEFAULT_SHOP_SHUFFLE_MODE,
  locked: false,
  synthetic: true,
};

const SHOP_SLOT_DEPTH_SEED: OptionSeed = {
  key: SHOP_SLOT_DEPTH_KEY,
  displayName: 'Items Per Shop Slot',
  group: 'shops',
  kind: 'range',
  implementation: 'active',
  range: { min: MIN_SHOP_SLOT_DEPTH, max: MAX_SHOP_SLOT_DEPTH },
  sourceDefault: DEFAULT_SHOP_SLOT_DEPTH,
  baseline: DEFAULT_SHOP_SLOT_DEPTH,
  locked: false,
  synthetic: true,
};

const SHOP_SLOT_OPTION_SEEDS: readonly OptionSeed[] = [
  SHOP_MODE_SEED,
  ...SHOP_SLOT_ROWS.map(({ slot, key, label }) => shopSlotToggleSeed(key, label, isShopOnByDefault(slot))),
];

const SHOP_SLOT_DESCRIPTIONS: Readonly<Record<string, string>> = Object.fromEntries(
  SHOP_SLOT_ROWS.map(({ slot, key }) => [key, shopSlotDescriptionOf(slot)]),
);

const SHOP_SLOT_OPTION_KEYS: readonly string[] = SHOP_SLOT_ROWS.map((row) => row.key);

const SHOP_SCOPE_OPTION_KEYS: readonly string[] = [
  SHOP_MODE_KEY, SHOP_SLOT_COUNT_KEY, SHOP_SLOT_DEPTH_KEY, ...SHOP_SLOT_OPTION_KEYS,
];

export {
  SHOP_MODE_SEED, SHOP_SCOPE_OPTION_KEYS, SHOP_SLOT_DEPTH_SEED, SHOP_SLOT_DESCRIPTIONS, SHOP_SLOT_OPTION_KEYS,
  SHOP_SLOT_OPTION_SEEDS, SHOP_SLOT_ROWS,
};
