/* @layer shared-game @kind data */
/**
 * What a row ABSENT from a stored snapshot means. The catalog baselines are
 * where a NEW profile starts, and they move when the maintainer moves them; a
 * snapshot frozen before one of these rows existed was generated under the
 * reading that shipped then, and has to keep meaning exactly that, whatever
 * the row's baseline says today. So the rows whose fresh baseline no longer
 * matches that reading are listed here, each derived from the legacy setting
 * its own block already keeps for the purpose, and normalizeRandomizerOptions
 * fills an absent one from this table before the baselines get a say.
 *
 * A row NOT listed here reads as its baseline when absent, which is right
 * for every row whose baseline still is the reading it shipped with. A row
 * that moves away from that reading later is one line here.
 */
import { LEGACY_CAPACITY_BONUS } from './ap-world/capacity/bonus/capacity-bonus.data';
import { capacityBonusValuesOf } from './ap-world/capacity/bonus/capacity-bonus-from-snapshot';
import { REFERENCE_CAPACITY_PROFILE } from './ap-world/capacity/capacity-profile-defaults';
import { capacityValuesOf } from './ap-world/capacity/capacity-profile-from-snapshot';
import { darkRoomValuesOf } from './ap-world/dark-rooms/dark-room-from-snapshot';
import { REFERENCE_DARK_ROOM_SETTING } from './ap-world/dark-rooms/dark-room-lights.data';
import { pondValuesOf } from './ap-world/pond/pond-from-snapshot';
import { LEGACY_POND_SETTING } from './ap-world/pond/pond-profile-defaults';
import { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY } from './ap-world/scope-option-keys';
import { BOTTLE_KEY, CURRENCY_ROWS, currencyKeyOf } from './ap-world/shops/shop-price-options.data';
import { SHOP_MODE_KEY, SHOP_SLOT_DEPTH_KEY } from './ap-world/shops/shop-slot-options.data';
import { MIN_SHOP_SLOT_DEPTH } from './ap-world/shops/shop-slots';
import type { ApOptionValue } from './ap-world/options.type';

/** No currency rolled: every shelf charges what the unmodified game charges. */
const NO_PRICE_ROLLS: Readonly<Record<string, ApOptionValue>> = Object.fromEntries(
  [...CURRENCY_ROWS.map(({ currency }) => currencyKeyOf(currency)), BOTTLE_KEY].map((key) => [key, false]),
);

const LEGACY_ABSENT_ROWS: Readonly<Record<string, ApOptionValue>> = {
  // Both scope switches shipped off. A v1 or v2 snapshot missing the
  // world-items one is re-read from the npc one by the scope-split rule, which
  // runs after this table; the pre-snapshot shape has neither and reads off.
  [INCLUDE_NPC_CHECKS_KEY]: false,
  [INCLUDE_WORLD_ITEMS_KEY]: false,
  // Boss rewards stayed in their own dungeons before the switch existed.
  dungeon_prize_shuffle: false,
  ...darkRoomValuesOf(REFERENCE_DARK_ROOM_SETTING),
  // Nothing shuffled and one purchase per slot; a v2 snapshot missing the
  // mode is then re-read as Sequential by the shop-legacy rule.
  [SHOP_MODE_KEY]: 'vanilla',
  [SHOP_SLOT_DEPTH_KEY]: MIN_SHOP_SLOT_DEPTH,
  ...NO_PRICE_ROLLS,
  ...capacityValuesOf(REFERENCE_CAPACITY_PROFILE),
  ...capacityBonusValuesOf(LEGACY_CAPACITY_BONUS),
  ...pondValuesOf(LEGACY_POND_SETTING),
};

export { LEGACY_ABSENT_ROWS };
