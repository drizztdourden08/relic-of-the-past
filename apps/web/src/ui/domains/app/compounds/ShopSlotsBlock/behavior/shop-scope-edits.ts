/* @layer renderer-components @kind logic */
/**
 * The edits the shop-slot block makes to a scope, and the arithmetic it shows.
 *
 * ONE number drives both the count control and the total sentence: `opened`,
 * the size of the set this scope really opens (shop-scope.ts). That is what
 * the counted modes take out of the ticked set, and in the custom mode it IS
 * the ticked set, so a control fed the stored `slotCount` instead would sit
 * still while the ticks moved, and its fill would even climb as the ceiling
 * under it dropped. The stored count is still re-clamped after every edit, so
 * the value the counted modes read can never outrun a ticked set the player
 * has just made smaller.
 */
import { clampCount, maxSlotCountOf, openedSlotIndicesOf, usesSlotCount } from '@shared/randomizer/ap-world/shops/shop-scope';
import { clampDepth } from '@shared/randomizer/ap-world/shops/shop-slots';
import type { ShopScope, ShopShuffleMode } from '@shared/randomizer/ap-world/shops/shop-scope.type';

interface ShopScopeSummary {
  /** Slots ticked: the ceiling every mode draws from, and the count's maximum. */
  ticked: number;
  /**
   * Slots this scope actually opens: the count control's displayed value in
   * every mode, and the first factor of the total.
   */
  opened: number;
  /** Items each opened slot carries. */
  depth: number;
  /** Locations the seed has to fill because of the shops. */
  locations: number;
  /** Whether the count control is the player's to set in this mode. */
  counts: boolean;
  /** Whether any shop control is live at all. */
  active: boolean;
}

/** Re-clamps the count to the ticked set, run after every edit, not just the slider's. */
const reclamped = (scope: ShopScope): ShopScope =>
  ({ ...scope, slotCount: clampCount(scope.slotCount, maxSlotCountOf(scope)) });

const withSlotTicked = (scope: ShopScope, canonicalIndex: number, ticked: boolean): ShopScope => {
  const next = new Set(scope.enabled);
  if (ticked) next.add(canonicalIndex);
  else next.delete(canonicalIndex);
  return reclamped({ ...scope, enabled: [...next].sort((a, b) => a - b) });
};

const withMode = (scope: ShopScope, mode: ShopShuffleMode): ShopScope =>
  reclamped({ ...scope, mode });

const withSlotCount = (scope: ShopScope, slotCount: number): ShopScope =>
  reclamped({ ...scope, slotCount });

const withDepth = (scope: ShopScope, depth: number): ShopScope =>
  ({ ...scope, depth: clampDepth(depth) });

const summaryOf = (scope: ShopScope): ShopScopeSummary => {
  const opened = openedSlotIndicesOf(scope).length;
  const depth = clampDepth(scope.depth);
  return {
    ticked: maxSlotCountOf(scope),
    opened,
    depth,
    locations: opened * depth,
    counts: usesSlotCount(scope.mode),
    active: scope.mode !== 'vanilla',
  };
};

export { summaryOf, withDepth, withMode, withSlotCount, withSlotTicked };
export type { ShopScopeSummary };
