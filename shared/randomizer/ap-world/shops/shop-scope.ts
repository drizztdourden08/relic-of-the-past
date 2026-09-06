/* @layer shared-game @kind logic */
/**
 * Scope → the canonical slots it opens.
 *
 * Two rules do all the work. The TICKED SET is the only thing a mode may draw
 * from, so no mode can ever open a slot the player switched off; and the count
 * is clamped to the size of that set, so the slider can never promise more
 * slots than exist. Everything downstream — the locations, the pool
 * accounting, the slider's own maximum in the panel — reads those two rules
 * from here rather than restating them.
 *
 * The random mode draws from the scope's own seed, so the same profile always
 * opens the same shelves: the placement is re-read at session time and has to
 * name exactly the slots it was generated with.
 */
import { createRng } from '../../rng';
import { STANDARD_SHOP_SLOT_COUNT } from './shops.data';
import type { ShopScope, ShopShuffleMode } from './shop-scope.type';

const SHOP_SHUFFLE_MODES: readonly ShopShuffleMode[] = ['vanilla', 'sequential', 'random', 'custom'];

/** The modes whose opened set is a COUNT taken out of the ticked set. */
const COUNTED_MODES: ReadonlySet<ShopShuffleMode> = new Set<ShopShuffleMode>(['sequential', 'random']);

const isShopShuffleMode = (value: unknown): value is ShopShuffleMode =>
  SHOP_SHUFFLE_MODES.includes(value as ShopShuffleMode);

/** Whether this mode consults the slot count at all — the slider's enabled test. */
const usesSlotCount = (mode: ShopShuffleMode): boolean => COUNTED_MODES.has(mode);

/** Ticked indices, deduplicated, in range and ascending — the canonical spelling of the set. */
const normalizeEnabled = (enabled: Iterable<number>): number[] =>
  [...new Set(enabled)]
    .filter((index) => Number.isInteger(index) && index >= 0 && index < STANDARD_SHOP_SLOT_COUNT)
    .sort((a, b) => a - b);

/**
 * The highest count this scope could honour: the size of its ticked set. The
 * panel's slider takes its maximum from here, so the control and the fill
 * always agree about what is on offer.
 */
const maxSlotCountOf = (scope: ShopScope): number => normalizeEnabled(scope.enabled).length;

const clampCount = (count: number, ceiling: number): number =>
  Math.min(ceiling, Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0)));

/**
 * The canonical slot indices this scope opens, ascending. Ascending even for
 * the random mode: WHICH slots it drew is the random part, the order they are
 * then named and armed in is not, so a spoiler reads the same way every time.
 */
const openedSlotIndicesOf = (scope: ShopScope): readonly number[] => {
  const { mode, slotCount, seed } = scope;
  const enabled = normalizeEnabled(scope.enabled);
  if (mode === 'vanilla') return [];
  if (mode === 'custom') return enabled;
  const wanted = clampCount(slotCount, enabled.length);
  if (mode === 'sequential') return enabled.slice(0, wanted);
  return createRng(`${seed}:shop-slots`).shuffle(enabled).slice(0, wanted).sort((a, b) => a - b);
};

export {
  SHOP_SHUFFLE_MODES, clampCount, isShopShuffleMode, maxSlotCountOf,
  normalizeEnabled, openedSlotIndicesOf, usesSlotCount,
};
