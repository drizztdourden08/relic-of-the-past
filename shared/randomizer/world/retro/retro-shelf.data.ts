/* @layer shared-game @kind data */
/**
 * What the arrow shelf sells under retro once it has no arrows to sell.
 *
 * The reference restocks the quiver's shelf, once the quiver is bought, with a
 * random pick out of a short list of shop staples (Shops.py set_up_shops,
 * replacement_items: the three potions, bombs, the blue shield, a heart). This
 * app takes one of them, the red potion refill, and sells it at the shelf's
 * OWN vanilla price, not the reference's, so a shelf that charged 30
 * for arrows charges 30 for the refill. The pick is an assumption written
 * down here instead of a rule the reference states; change the name and every
 * arrow shelf follows.
 */
import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';

/** The item every arrow shelf falls back to under retro. */
const RETRO_REFILL_ITEM: ItemId = ITEM.redPotion;

export { RETRO_REFILL_ITEM };
