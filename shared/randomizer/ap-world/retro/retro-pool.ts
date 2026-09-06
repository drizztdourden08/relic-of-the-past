/* @layer shared-game @kind logic */
/**
 * Arrows out of the pool, and the quiver into it.
 *
 * ARROWS OUT. The reference swaps every arrow pickup for a five-rupee one
 * (ItemPool.py 725-727), which is what makes retro retro: arrows stop being a
 * thing you find, because they stop being a thing you carry. Swapping rather
 * than removing keeps the transcribed pool size, exactly as the tier ticks do,
 * so the fill still has one item per open location.
 *
 * The reference strips the arrow capacity upgrades in the same line, and so does this
 * app, one step earlier: retro pins the projectiles capacity family to Vanilla
 * (capacity/retro-projectiles.ts), so its card is inert and its upgrades never
 * reach the pool for this pass to see. Nothing is left here to strip.
 *
 * THE QUIVER IN. With the shops shuffled the quiver stops being shop stock and
 * becomes a placeable item (retro-shops.ts), so the pool carries one. It is
 * not an extra item: the shelf it used to be locked to opens as an ordinary
 * shuffled slot in the same breath, and a slot the fill can use is worth
 * exactly one pool item. So the quiver is counted as one of the shop
 * backfills the opened slots earn rather than as an addition to them, and the
 * pool still holds one item per open location (pool/build-item-pool.ts).
 */
import { RETRO_ARROW_PICKUPS, RETRO_QUIVER_ITEM, RETRO_REPLACEMENT_ITEM } from './retro-bow.data';
import { retroQuiverInPool } from './retro-shops';
import type { ShopScope } from '../shops/shop-scope.type';
import type { RetroBowSetting } from './retro.type';

/** In place: every arrow pickup the shuffle still carries becomes a small rupee pickup. */
const applyRetroBowPool = (pool: string[], setting: RetroBowSetting): void => {
  if (!setting.enabled) return;
  for (let index = 0; index < pool.length; index += 1) {
    if (RETRO_ARROW_PICKUPS.includes(pool[index])) pool[index] = RETRO_REPLACEMENT_ITEM;
  }
};

/** The quiver copies this seed's pool carries: one while it is placeable, none otherwise. */
const retroQuiverPoolItems = (
  scope: ShopScope | undefined, setting: RetroBowSetting | undefined,
): readonly string[] => (retroQuiverInPool(scope, setting) ? [RETRO_QUIVER_ITEM] : []);

export { applyRetroBowPool, retroQuiverPoolItems };
