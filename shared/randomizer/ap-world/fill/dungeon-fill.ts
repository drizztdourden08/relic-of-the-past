/* @layer shared-game @kind logic */
/**
 * Restrictive prefill of the dungeon-restricted items into the dungeons — the
 * port of Dungeons.py fill_dungeons_restrictive (197-270): one location list
 * pooled across every dungeon and shuffled, items sorted so big keys place
 * first, then small keys, then maps/compasses (the source's ascending sort
 * popped from the end of the deque), the placement restriction the shuffle
 * modes decide, and an assumed inventory of the entire non-dungeon pool
 * (all_state_base collects the full item pool, 237-252). Locked vanilla drop
 * keys are NOT assumed — the source removes them from the base state
 * (258-267) so they only enter through the placement sweep — which is
 * exactly how the fill world models them (pre-placed, swept when reachable).
 * The source's goal-item removal (253-256) is skipped: no ported access rule
 * reads the goal item, only the completion check does.
 *
 * The restriction follows the source's two name sets (Dungeons.py 199-223):
 * everything reaching this pass is dungeon_local (a family that left the
 * dungeons never arrives here at all — build-item-pool.ts puts it in the
 * shuffled pool instead), and only the families in dungeon_specific_item_names
 * — the original_dungeon ones — are additionally pinned to the dungeon that
 * owns them. The sort's `+5` for a dungeon-specific item is the source's own
 * (231-232): those are the hardest to place, so they go first. It is a
 * constant across every item under the baseline, which leaves the order the
 * stable sort has always produced.
 */
import { fillRestrictive } from './ap-fill';
import { fillEligibleLocations } from './fill-world';
import { modeOfDungeonItem, staysInOwnDungeon } from '../dungeon-items/dungeon-item-modes';
import type { Rng } from '../../rng';
import type { FillWorld } from './fill-world.type';

const SPECIFIC_SORT_BONUS = 5;

const prefillDungeonItems = (fillWorld: FillWorld, rng: Rng): void => {
  const { world, pool, locationDungeon, itemDungeon, dungeonItems: setting, accessibility } = fillWorld;

  const items: string[] = [];
  for (const dungeon of world.dungeons.values()) {
    items.push(...(pool.dungeonItems.get(dungeon.name) ?? []));
  }
  const isSpecific = (name: string): boolean => staysInOwnDungeon(modeOfDungeonItem(setting, name));
  const rankOf = (name: string): number => {
    const dungeon = world.dungeons.get(itemDungeon.get(name) ?? '');
    const bonus = isSpecific(name) ? SPECIFIC_SORT_BONUS : 0;
    if (dungeon === undefined) return 1 + bonus;
    if (name === dungeon.bigKey) return 3 + bonus;
    if (name === dungeon.smallKey) return 2 + bonus;
    return 1 + bonus;
  };
  items.sort((a, b) => rankOf(a) - rankOf(b));

  const locations = rng.shuffle(
    fillEligibleLocations(fillWorld).filter((name) => locationDungeon.has(name)),
  );

  fillRestrictive({
    world,
    items,
    locations,
    assumedItems: pool.pool,
    relaxWhenBeatable: accessibility === 'minimal',
    allowedAt: (itemName, locationName) =>
      !isSpecific(itemName) || itemDungeon.get(itemName) === locationDungeon.get(locationName),
  });
};

export { prefillDungeonItems };
