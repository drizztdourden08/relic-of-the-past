/* @layer shared-game @kind data */
/**
 * What the fill treats each pool item name as: progression, useful, or the filler everything
 * else is.
 *
 * The class of an item is a fact about the item, so it is read off `poolClass` on the item
 * records. Three groups of pool names have no record of their own and are listed here:
 *
 *   the counted families' larger jumps   a jump-of-N upgrade exists as a pool name generated
 *                                        from capacity-upgrade-names.data.ts, and only the
 *                                        first, second and whole-grid jumps are records. They
 *                                        are progression in the reference's own table (Items.py
 *                                        113-121), and they only enter the pool while their
 *                                        family is shuffled.
 *   the retro quiver                     this app's own item, on the same "progression when in
 *                                        pool" terms: it is only there while retro is on and
 *                                        the shops are shuffled (retro/retro-pool.ts).
 *
 * ItemPool.py 496-509 promotes ONE Boss Heart Container to progression at generation time (the
 * hearts-as-requirement branch); the pool port keeps the static classification and surfaces
 * the promotion as a documented count.
 */
import { all } from '@shared/game/data';
import { EXPLOSIVES_UPGRADE_NAMES, PROJECTILES_UPGRADE_NAMES } from '@shared/game/data/capacity-upgrade-names.data';
import { itemKeyOfName } from '../display-names/item-key-name';
import { RETRO_QUIVER_ITEM } from '../retro/retro-bow.data';
import type { ItemKey } from '../item-ids.data';

const itemsClassed = (poolClass: 'progression' | 'useful'): readonly ItemKey[] =>
  all('item').filter((item) => item.poolClass === poolClass).map((item) => item.id);

const PROGRESSION_ITEMS: ReadonlySet<ItemKey> = new Set<ItemKey>([
  ...itemsClassed('progression'),
  ...EXPLOSIVES_UPGRADE_NAMES.map(itemKeyOfName),
  ...PROJECTILES_UPGRADE_NAMES.map(itemKeyOfName),
  RETRO_QUIVER_ITEM,
]);

const USEFUL_ITEMS: ReadonlySet<ItemKey> = new Set<ItemKey>(itemsClassed('useful'));

export { PROGRESSION_ITEMS, USEFUL_ITEMS };
