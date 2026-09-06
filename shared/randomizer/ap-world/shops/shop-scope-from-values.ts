/* @layer shared-game @kind logic */
/**
 * Catalog values → the shop scope, and back again. ONE reading, shared by the
 * generator, the pool accounting and the creation panel, so the control, the
 * In Pool column and the seed can never disagree about what a snapshot asks
 * for.
 *
 * A missing tick row reads as its own baseline rather than as off, so a
 * snapshot written before a shop was added still opens what that shop's
 * default says — the same tolerance every other row of the catalog gets.
 */
import { CANONICAL_SLOTS, clampDepth } from './shop-slots';
import { isShopShuffleMode, normalizeEnabled } from './shop-scope';
import {
  DEFAULT_SHOP_SHUFFLE_MODE, DEFAULT_SHOP_SLOT_DEPTH, SHOP_MODE_KEY, SHOP_SLOT_COUNT_KEY, SHOP_SLOT_DEPTH_KEY,
  SHOP_SLOT_ROWS,
} from './shop-slot-options.data';
import type { ApOptionValue } from '../options.type';
import type { ShopScope, ShopShuffleMode } from './shop-scope.type';

type Values = Readonly<Record<string, ApOptionValue>>;

/** The scope that opens nothing — a placement frozen before shops existed. */
const NO_SHOP_SCOPE: ShopScope = { mode: 'vanilla', enabled: [], slotCount: 0, depth: 1, seed: '' };

const numberAt = (values: Values, key: string, fallback: number): number =>
  (typeof values[key] === 'number' ? values[key] : fallback);

const modeOf = (values: Values): ShopShuffleMode => {
  const raw = values[SHOP_MODE_KEY];
  return isShopShuffleMode(raw) ? raw : 'vanilla';
};

/** The ticked slots, as canonical indices. */
const enabledSlotsOf = (values: Values): readonly number[] => normalizeEnabled(
  SHOP_SLOT_ROWS.filter((row) => (values[row.key] ?? row.defaultOn) === true).map((row) => row.canonicalIndex),
);

/**
 * |seed| is the placement's own seed; only the random mode reads it, and it is
 * stored ON the scope so the session rebuilds the identical opened set.
 */
const shopScopeOfValues = (values: Values, seed = ''): ShopScope => ({
  mode: modeOf(values),
  enabled: enabledSlotsOf(values),
  slotCount: numberAt(values, SHOP_SLOT_COUNT_KEY, 0),
  depth: clampDepth(numberAt(values, SHOP_SLOT_DEPTH_KEY, 1)),
  seed,
});

/** The catalog values a scope stands for — the panel's write direction. */
const shopScopeValues = (scope: ShopScope): Readonly<Record<string, ApOptionValue>> => {
  const ticked = new Set(scope.enabled);
  return {
    [SHOP_MODE_KEY]: scope.mode,
    [SHOP_SLOT_COUNT_KEY]: scope.slotCount,
    [SHOP_SLOT_DEPTH_KEY]: scope.depth,
    ...Object.fromEntries(SHOP_SLOT_ROWS.map((row) => [row.key, ticked.has(row.canonicalIndex)])),
  };
};

/** The scope a brand-new profile starts on: every default tick, shuffled as exactly that set, two deep. */
const defaultShopScope = (): ShopScope => ({
  mode: DEFAULT_SHOP_SHUFFLE_MODE,
  enabled: normalizeEnabled(SHOP_SLOT_ROWS.filter((row) => row.defaultOn).map((row) => row.canonicalIndex)),
  slotCount: 0,
  depth: DEFAULT_SHOP_SLOT_DEPTH,
  seed: '',
});

/** Slot count of the whole canonical list — the ceiling any control may offer. */
const TOTAL_SHOP_SLOTS = CANONICAL_SLOTS.length;

export {
  NO_SHOP_SCOPE, TOTAL_SHOP_SLOTS, defaultShopScope, enabledSlotsOf,
  shopScopeOfValues, shopScopeValues,
};
