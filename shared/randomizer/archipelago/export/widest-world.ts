/* @layer shared-game @kind logic */
/**
 * The widest world: every location any option can declare (key drops on, every pond rung of
 * every pond present, every shelf slot opened at its deepest restock), with its rules
 * registered. Its trees are the ones the world package ships. A rule's SHAPE never depends on
 * a setting or a seed (settings are `option` leaves, rolled values are `seed` leaves), so the
 * widest world's tree for a location is that location's tree in every world that holds it.
 *
 * The seed table is emptied on the way out: the values belong to one profile and travel in its
 * player file, never in the package.
 */
import { buildWorld } from '../../world/build-world';
import { registerRules } from '../../world/rules/register';
import { VANILLA_MEDALLIONS } from '../../world/item-groups';
import { capacityPondSpots } from '../../world/capacity/capacity-spots';
import { POND_EXTRA_LOCATIONS, POND_PRIZE_LOCATIONS } from '../../world/pond/pond-rungs';
import { CANONICAL_SLOTS } from '../../world/shops/shop-slot-facts';
import { MAX_SHOP_SLOT_DEPTH } from '../../world/shops/shop-slots';
import type { World, WorldOptions } from '../../world/world.type';
import type { ShopScope } from '../../world/shops/shop-scope.type';

/** Every shelf ticked and opened, each carrying its deepest restock. */
const WIDEST_SHOP_SCOPE: ShopScope = {
  mode: 'custom',
  enabled: CANONICAL_SLOTS.map((_slot, index) => index),
  slotCount: CANONICAL_SLOTS.length,
  depth: MAX_SHOP_SLOT_DEPTH,
  seed: 'archipelago',
};

const widestWorldOptions = (): WorldOptions => ({
  keyDropShuffle: true,
  medallions: { ...VANILLA_MEDALLIONS },
  pondLocations: [...POND_EXTRA_LOCATIONS, ...capacityPondSpots()],
  pondPrizeLocations: POND_PRIZE_LOCATIONS,
  shops: WIDEST_SHOP_SCOPE,
});

/** The widest world with every rule registered and no seed values. */
const widestRuledWorld = (): World => {
  const world = buildWorld(widestWorldOptions());
  registerRules(world);
  world.seedValues.clear();
  return world;
};

export { widestRuledWorld, widestWorldOptions };
