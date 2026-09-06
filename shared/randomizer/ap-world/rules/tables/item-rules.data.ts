/* @layer shared-game @kind data */
/**
 * Item-placement constraints of the baseline path, from tests/fixtures/
 * ap-source/Rules.py: the goal item lock (203), the prize-slot restriction
 * (204-211), the swamp big-key forbid (404-405: only while the small keys stay
 * pinned to their own dungeon, glitches no_glitches), and every
 * set_always_allow / allow_self_locking_items row the source installs. The
 * reference's allow_self_locking_items is modelled as the always-allow
 * predicate it installs. The forest-den allowance (419-420) exists only with
 * the key-drop option OFF. Every allowance but 327-328 is guarded by
 * `accessibility != 'full'`; the fill-facing world builder prunes the registry
 * to FULL_ACCESS_ALWAYS_ALLOW when that is the contract in force.
 */
import { PRIZE_ITEMS, VICTORY_ITEM } from '../../pool/event-items.data';
import { PRIZE_LOCATIONS } from '../../special-locations.data';
import { DEFAULT_DUNGEON_ITEM_SETTING, staysInOwnDungeon } from '../../dungeon-items/dungeon-item-modes';
import type { ApWorld } from '../../world.type';
import type { AlwaysAllowEntry, ItemRuleEntry } from '../rule-entry.type';

const PRIZE_SET = new Set(PRIZE_ITEMS);

const buildItemRuleEntries = (world: ApWorld): ItemRuleEntry[] => {
  const entries: ItemRuleEntry[] = [
    // 203: the final fight only carries the goal item.
    { location: 'Ganon', allowed: (item) => item === VICTORY_ITEM },
    // 204-211: prize slots only carry prize items.
    ...[...PRIZE_LOCATIONS].map((location): ItemRuleEntry => ({
      location,
      allowed: (item) => PRIZE_SET.has(item),
    })),
  ];
  // 404-405: guarded by `not small_key_shuffle`, and a Choice is falsy only at
  // value 0, so the forbid exists exactly while the small keys stay pinned to
  // their own dungeon. (The glitch half of the guard is fixed at no_glitches.)
  const smallKeys = (world.options.dungeonItems ?? DEFAULT_DUNGEON_ITEM_SETTING).smallKey;
  if (staysInOwnDungeon(smallKeys)) {
    entries.push({
      location: 'Swamp Palace - Entrance', allowed: (item) => item !== 'Big Key (Swamp Palace)',
    });
  }
  return entries;
};

const buildAlwaysAllowEntries = (world: ApWorld): AlwaysAllowEntry[] => {
  const entries: AlwaysAllowEntry[] = [
    // 327-328
    {
      location: 'Eastern Palace - Big Key Chest',
      rule: (_state, item) => item === 'Big Key (Eastern Palace)',
    },
    // 387-388
    {
      location: 'Tower of Hera - Big Key Chest',
      rule: (_state, item) => item === 'Small Key (Tower of Hera)',
    },
    // 401-402 (allow_self_locking_items)
    {
      location: 'Swamp Palace - Big Chest',
      rule: (_state, item) => item === 'Big Key (Swamp Palace)',
    },
    // 431-432 (allow_self_locking_items)
    {
      location: 'Skull Woods - Big Chest',
      rule: (_state, item) => item === 'Big Key (Skull Woods)',
    },
    // 533-534
    {
      location: 'Palace of Darkness - Big Key Chest',
      rule: (state, item) => item === 'Small Key (Palace of Darkness)'
        && state.has('Small Key (Palace of Darkness)', 5),
    },
    // 538-539
    {
      location: 'Palace of Darkness - Harmless Hellway',
      rule: (state, item) => item === 'Small Key (Palace of Darkness)'
        && state.has('Small Key (Palace of Darkness)', 5),
    },
    // 1232-1234
    {
      location: 'Turtle Rock - Big Key Chest',
      rule: (state, item) => item === 'Small Key (Turtle Rock)'
        && state.canReachRegion('Turtle Rock (Second Section)'),
    },
  ];
  // 419-420: only without the key-drop option.
  if (!world.options.keyDropShuffle) {
    entries.push({
      location: 'Thieves\' Town - Big Chest',
      rule: (_state, item) => item === 'Small Key (Thieves Town)',
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
const FULL_ACCESS_ALWAYS_ALLOW: ReadonlySet<string> = new Set([
  'Eastern Palace - Big Key Chest',
]);

export { buildItemRuleEntries, buildAlwaysAllowEntries, FULL_ACCESS_ALWAYS_ALLOW };
