/* @layer shared-game @kind data */
/**
 * Item-placement constraints of the baseline path, from tests/fixtures/
 * ap-source/Rules.py: the prize-slot restriction
 * (204-211), the swamp big-key forbid (404-405: only while the small keys stay
 * pinned to their own dungeon, glitches no_glitches), and every
 * set_always_allow / allow_self_locking_items row the source installs. The
 * reference's allow_self_locking_items is modelled as the always-allow
 * predicate it installs. The forest-den allowance (419-420) exists only with
 * the key-drop option OFF. Every allowance but 327-328 is guarded by
 * `accessibility != 'full'`; the fill-facing world builder prunes the registry
 * to FULL_ACCESS_ALWAYS_ALLOW when that is the contract in force.
 */
import type { LocationKey } from '../../location-key';
import { ITEM } from '../../item-ids.data';
import { REGION } from '../../region-ids.data';
import { PRIZE_ITEMS } from '../../pool/prize-items.data';
import { PRIZE_LOCATIONS } from '../../scope-tables';
import { DEFAULT_DUNGEON_ITEM_SETTING, staysInOwnDungeon } from '../../dungeon-items/dungeon-item-modes';
import type { ItemKey } from '../../item-ids.data';
import type { World } from '../../world.type';
import type { AlwaysAllowEntry, ItemRuleEntry } from '../rule-entry.type';

const PRIZE_SET: ReadonlySet<ItemKey> = new Set<ItemKey>(PRIZE_ITEMS);

const buildItemRuleEntries = (world: World): ItemRuleEntry[] => {
  // 204-211: prize slots only carry prize items. The goal lock (203) has no row: the final
  // fight is a story event of the world, never a location an item could sit at.
  const entries: ItemRuleEntry[] = [...PRIZE_LOCATIONS].map((location): ItemRuleEntry => ({
    location,
    allowed: (item) => PRIZE_SET.has(item),
  }));
  // 404-405: guarded by `not small_key_shuffle`, and a Choice is falsy only at
  // value 0, so the forbid exists exactly while the small keys stay pinned to
  // their own dungeon. (The glitch half of the guard is fixed at no_glitches.)
  const smallKeys = (world.options.dungeonItems ?? DEFAULT_DUNGEON_ITEM_SETTING).smallKey;
  if (staysInOwnDungeon(smallKeys)) {
    entries.push({
      location: 'check-157', allowed: (item) => item !== ITEM.bigKeySwampPalace,
    });
  }
  return entries;
};

const buildAlwaysAllowEntries = (world: World): AlwaysAllowEntry[] => {
  const entries: AlwaysAllowEntry[] = [
    // 327-328
    {
      location: 'check-119',
      rule: (_state, item) => item === ITEM.bigKeyEasternPalace,
    },
    // 387-388
    {
      location: 'check-137',
      rule: (_state, item) => item === ITEM.smallKeyTowerOfHera,
    },
    // 401-402 (allow_self_locking_items)
    {
      location: 'check-159',
      rule: (_state, item) => item === ITEM.bigKeySwampPalace,
    },
    // 431-432 (allow_self_locking_items)
    {
      location: 'check-186',
      rule: (_state, item) => item === ITEM.bigKeySkullWoods,
    },
    // 533-534
    {
      location: 'check-145',
      rule: (state, item) => item === ITEM.smallKeyPalaceOfDarkness
        && state.has(ITEM.smallKeyPalaceOfDarkness, 5),
    },
    // 538-539
    {
      location: 'check-154',
      rule: (state, item) => item === ITEM.smallKeyPalaceOfDarkness
        && state.has(ITEM.smallKeyPalaceOfDarkness, 5),
    },
    // 1232-1234
    {
      location: 'check-224',
      rule: (state, item) => item === ITEM.smallKeyTurtleRock
        && state.canReachRegion(REGION.turtleRockSecondSection),
    },
  ];
  // 419-420: only without the key-drop option.
  if (!world.options.keyDropShuffle) {
    entries.push({
      location: 'check-178',
      rule: (_state, item) => item === ITEM.smallKeyThievesTown,
    });
  }
  return entries;
};

/**
 * The always-allow rows the reference keeps when accessibility is FULL: only
 * the unconditional Rules.py 327-328 row survives, since every other row above is
 * guarded by `accessibility != 'full'` (387, 401, 419, 431, 533, 538, 1232).
 * The fill-facing world builder prunes the registry down to this set, because
 * the generator's validity contract is full accessibility.
 */
const FULL_ACCESS_ALWAYS_ALLOW: ReadonlySet<LocationKey> = new Set<LocationKey>([
  'check-119',
]);

export { buildItemRuleEntries, buildAlwaysAllowEntries, FULL_ACCESS_ALWAYS_ALLOW };
