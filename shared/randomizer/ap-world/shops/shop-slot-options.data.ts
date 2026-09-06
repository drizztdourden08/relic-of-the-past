/* @layer shared-game @kind data */
/**
 * The shop-scope rows of the option catalog: the shuffle mode, one tick per
 * canonical slot, and the two counted rows the mode reads (how many slots and
 * how deep each one stocks). Synthetic, unlocked, group 'shops'.
 *
 * The tick rows are generated from the shop dataset itself, so a shop added
 * there brings its own controls with it and there is no second list of slots
 * to keep in step. Every slot is ticked by default EXCEPT the potion
 * seller's hut: it is fully supported, but a hut cauldron holding a shuffled
 * item is a bigger surprise than a shelf doing so, so it is opt-in.
 *
 * The panel renders all of these as one block (ShopSlotsBlock), the way the
 * price rows and the capacity families render theirs, so they stay out of the
 * plain option list.
 */
import { itemDisplayName } from '../display-names/item-display-name';
import { DEFAULT_OFF_SHOPS, LEGACY_SHOP_SLOT_COUNT, SHOP_DEFS } from './shops.data';
import { MAX_SHOP_SLOT_DEPTH, MIN_SHOP_SLOT_DEPTH } from './shop-slots';
import { SHOP_SHUFFLE_MODES } from './shop-scope';
import type { ApOptionDef } from '../options.type';
import type { ShopShuffleMode } from './shop-scope.type';
import type { ShopDef, ShopSlotDef } from './shops.data';

type Seed = Omit<ApOptionDef, 'description'>;

const SHOP_MODE_KEY = 'shop_shuffle_mode';
const SHOP_SLOT_COUNT_KEY = 'shop_item_slots';
const SHOP_SLOT_DEPTH_KEY = 'shop_slot_depth';

/**
 * Where a fresh profile starts: exactly the ticked slots are shuffled, two
 * purchases deep. A snapshot with neither row still reads as it always did
 * (options-snapshot.ts): the mode as Sequential, the depth as one.
 */
const DEFAULT_SHOP_SHUFFLE_MODE: ShopShuffleMode = 'custom';
const DEFAULT_SHOP_SLOT_DEPTH = 2;

/** Plain-language label for each mode, in the order the dropdown offers them. */
const SHOP_MODE_LABELS: Readonly<Record<string, string>> = {
  vanilla: 'Vanilla (nothing shuffled)',
  sequential: 'Sequential (the first ticked slots)',
  random: 'Random (ticked slots drawn from the seed)',
  custom: 'Custom (exactly the ticked slots)',
};

const slugOf = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

/**
 * A slot's catalog key. Built from the shop's name and shelf position rather
 * than its canonical index, so a stored snapshot says in plain text which
 * shelf it ticked.
 */
const shopSlotKeyOf = (shop: ShopDef, slot: ShopSlotDef): string =>
  (slot.position === 'Single'
    ? `shop_slot_${slugOf(shop.name)}`
    : `shop_slot_${slugOf(shop.name)}_${slot.position.toLowerCase()}`);

const shopSlotLabelOf = (shop: ShopDef, slot: ShopSlotDef): string =>
  (slot.position === 'Single' ? shop.name : `${shop.name}, ${slot.position}`);

/**
 * What the shelf normally sells, named the way the dataset names it
 * (display-names/). Most of the stock is in the record set and comes back
 * verbatim; the few pieces that are shop-only — the potions, the bee — are not
 * records, so they keep the transcribed name the shop table already carries.
 */
const stockNameOf = (slot: ShopSlotDef): string => itemDisplayName(slot.vanillaItem, slot.vanillaItem);

const shopSlotDescriptionOf = (slot: ShopSlotDef): string => `Normally sells ${stockNameOf(slot)}.`;

/** Whether a shop's slots start ticked. */
const isShopOnByDefault = (shop: ShopDef): boolean => !DEFAULT_OFF_SHOPS.includes(shop.name);

interface ShopSlotRow {
  shop: ShopDef;
  slot: ShopSlotDef;
  key: string;
  label: string;
  /** Baseline of this row's toggle — what an absent value reads as. */
  defaultOn: boolean;
  /** The slot's stable id: its index across every shop, in canonical order. */
  canonicalIndex: number;
}

/** Every canonical slot's row, in canonical order — the block renders them shop by shop. */
const SHOP_SLOT_ROWS: readonly ShopSlotRow[] = SHOP_DEFS.flatMap((shop, shopIndex) =>
  shop.slots.map((slot, slotIndex) => ({
    shop,
    slot,
    key: shopSlotKeyOf(shop, slot),
    label: shopSlotLabelOf(shop, slot),
    defaultOn: isShopOnByDefault(shop),
    canonicalIndex: SHOP_DEFS.slice(0, shopIndex).reduce((sum, def) => sum + def.slots.length, 0) + slotIndex,
  })));

const toggleSeed = (key: string, displayName: string, baseline: boolean): Seed => ({
  key, displayName, group: 'shops', kind: 'toggle', implementation: 'active',
  apDefault: baseline, baseline, locked: false, synthetic: true,
});

const SHOP_MODE_SEED: Seed = {
  key: SHOP_MODE_KEY,
  displayName: 'Shop Shuffle',
  group: 'shops',
  kind: 'choice',
  implementation: 'active',
  choices: SHOP_SHUFFLE_MODES.map((mode) => ({ value: mode, apValue: mode, label: SHOP_MODE_LABELS[mode] })),
  apDefault: DEFAULT_SHOP_SHUFFLE_MODE,
  baseline: DEFAULT_SHOP_SHUFFLE_MODE,
  locked: false,
  synthetic: true,
};

const SHOP_SLOT_DEPTH_SEED: Seed = {
  key: SHOP_SLOT_DEPTH_KEY,
  displayName: 'Items Per Shop Slot',
  group: 'shops',
  kind: 'range',
  implementation: 'active',
  range: { min: MIN_SHOP_SLOT_DEPTH, max: MAX_SHOP_SLOT_DEPTH },
  apDefault: DEFAULT_SHOP_SLOT_DEPTH,
  baseline: DEFAULT_SHOP_SLOT_DEPTH,
  locked: false,
  synthetic: true,
};

const SHOP_SLOT_OPTION_SEEDS: readonly Seed[] = [
  SHOP_MODE_SEED,
  ...SHOP_SLOT_ROWS.map(({ shop, key, label }) => toggleSeed(key, label, isShopOnByDefault(shop))),
];

/** Descriptions for the generated rows, merged into the catalog's description table. */
const SHOP_SLOT_DESCRIPTIONS: Readonly<Record<string, string>> = Object.fromEntries(
  SHOP_SLOT_ROWS.map(({ slot, key }) => [key, shopSlotDescriptionOf(slot)]),
);

/** Keys of the tick rows alone — the set the block owns and the plain list skips. */
const SHOP_SLOT_OPTION_KEYS: readonly string[] = SHOP_SLOT_ROWS.map((row) => row.key);

/** Every key the shop-scope block renders, ticks and counted rows alike. */
const SHOP_SCOPE_OPTION_KEYS: readonly string[] = [
  SHOP_MODE_KEY, SHOP_SLOT_COUNT_KEY, SHOP_SLOT_DEPTH_KEY, ...SHOP_SLOT_OPTION_KEYS,
];

const isShopScopeOptionKey = (key: string): boolean => SHOP_SCOPE_OPTION_KEYS.includes(key);

/**
 * The tick rows of the slots that did NOT exist when the shop option shipped
 * — the split doors, the hut and the bomb counter. A snapshot frozen before
 * the mode row existed is read with exactly these forced off, so its stored
 * slot count still opens the slots it always opened.
 */
const POST_LEGACY_SHOP_SLOT_KEYS: readonly string[] = SHOP_SLOT_ROWS
  .filter((row) => row.canonicalIndex >= LEGACY_SHOP_SLOT_COUNT)
  .map((row) => row.key);

export {
  DEFAULT_SHOP_SHUFFLE_MODE, DEFAULT_SHOP_SLOT_DEPTH,
  POST_LEGACY_SHOP_SLOT_KEYS, SHOP_MODE_KEY, SHOP_MODE_LABELS, SHOP_MODE_SEED,
  SHOP_SCOPE_OPTION_KEYS, SHOP_SLOT_COUNT_KEY, SHOP_SLOT_DEPTH_KEY, SHOP_SLOT_DEPTH_SEED,
  SHOP_SLOT_DESCRIPTIONS, SHOP_SLOT_OPTION_KEYS, SHOP_SLOT_OPTION_SEEDS, SHOP_SLOT_ROWS,
  isShopScopeOptionKey, shopSlotKeyOf,
};
export type { ShopSlotRow };
