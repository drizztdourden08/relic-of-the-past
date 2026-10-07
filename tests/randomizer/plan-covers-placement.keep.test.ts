/* @layer tests @kind test */
/**
 * No-silent-drop guard: every location a generated placement names must show
 * up in the physical plan, as an entry (a class the session acts on or
 * reports) or as an explicit error. A location that is neither
 * planned nor reported is exactly the failure that let the shuffled dungeon
 * prizes disappear between generation and the session.
 *
 * Also pins that each prize slot holds its dungeon's vanilla prize, so the
 * spoiler, the pool listing, the tracker and the logic agree with the game.
 *
 * The guard over a rename map is gone with the map: a location has one name, and a stored
 * placement carrying an older one reads as absent and is regenerated
 * (lib/randomizer-placement-io.ts).
 */
import { describe, expect, it } from 'vitest';
import { generatePlacement } from '@shared/randomizer/world/fill/generate';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { PRIZE_LOCATIONS, VANILLA_PRIZES } from '@shared/randomizer/world/scope-tables';
import { isShopSlotLocation } from '@shared/randomizer/world/shops/shop-slots';
import { STANDARD_SHOP_SLOT_COUNT } from '@shared/randomizer/world/shops/shop-slot-facts';
import { SHOP_MODE_KEY, SHOP_SLOT_ROWS } from '@shared/randomizer/world/shops/shop-slot-options.data';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { LocationKey } from '@shared/randomizer/world/location-key';

// The bridge chain pulls in log-bus, which wires window handlers at import
// time; this suite runs in node, so a stand-in goes in before the dynamic import.
(globalThis as { window?: unknown }).window ??= { addEventListener: () => undefined };
const { buildPhysicalPlan } = await import('@app/lib/game/randomizer-client/placement-bridge');

const DELIVERABLE_NPC: ReadonlySet<LocationKey> = new Set<LocationKey>([
  'check-019', 'check-033', 'check-060', 'check-121',
]);
const DELIVERABLE_WORLD: ReadonlySet<LocationKey> = new Set<LocationKey>([
  'check-055', 'check-080', 'check-126', 'check-009',
]);

/** Every slot ticked, the hut and the bomb counter included. */
const EVERY_SHOP_SLOT: Record<string, OptionValue> =
  Object.fromEntries(SHOP_SLOT_ROWS.map((row) => [row.key, true]));

interface OptionSet {
  name: string;
  overrides: Record<string, OptionValue>;
  npc?: ReadonlySet<LocationKey>;
  world?: ReadonlySet<LocationKey>;
}

const OPTION_SETS: readonly OptionSet[] = [
  { name: 'fresh defaults, nothing deliverable', overrides: {} },
  {
    name: 'key drops + npc + world items on',
    overrides: { key_drop_shuffle: true, include_npc_checks: true, include_world_items: true },
    npc: DELIVERABLE_NPC,
    world: DELIVERABLE_WORLD,
  },
  // A shop slot reaches the session through a seam of its own, so it is the case most likely
  // to be dropped between generation and the session. Every mode is pinned, and both depths,
  // because each mode chooses a different set of slots and the hut and the bomb counter reach
  // the plan through seams of their own.
  {
    name: 'every shop slot, one item each',
    overrides: { ...EVERY_SHOP_SLOT, [SHOP_MODE_KEY]: 'custom', shop_slot_depth: 1 },
  },
  {
    name: 'every shop slot, five items each',
    overrides: { ...EVERY_SHOP_SLOT, [SHOP_MODE_KEY]: 'custom', shop_slot_depth: 5 },
  },
  {
    name: 'sequential over every slot',
    overrides: {
      ...EVERY_SHOP_SLOT, [SHOP_MODE_KEY]: 'sequential',
      shop_item_slots: STANDARD_SHOP_SLOT_COUNT, shop_slot_depth: 2,
    },
  },
  {
    name: 'random half the slots',
    overrides: {
      ...EVERY_SHOP_SLOT, [SHOP_MODE_KEY]: 'random',
      shop_item_slots: Math.floor(STANDARD_SHOP_SLOT_COUNT / 2), shop_slot_depth: 3,
    },
  },
];

describe('physical plan covers every generated location', () => {
  for (const { name, overrides, npc, world } of OPTION_SETS) {
    it(name, () => {
      const snapshot = buildOptionsSnapshot(overrides);
      const placement = generatePlacement(`plan-coverage-${name}`, snapshot, npc, undefined, world);
      const plan = buildPhysicalPlan(placement);

      const covered = new Set<string>([
        ...plan.entries.map((entry) => entry.location),
        ...plan.errors.map((error) => error.location),
      ]);
      const dropped = Object.keys(placement.locations).filter((location) => !covered.has(location));
      expect(dropped).toEqual([]);
      // A shelf slot must be a real physical entry, never an error row.
      expect(plan.errors.filter((error) => isShopSlotLocation(error.location))).toEqual([]);
      const shopEntries = plan.entries.filter((entry) => isShopSlotLocation(entry.location));
      expect(shopEntries.every((entry) => entry.planClass === 'override-shop')).toBe(true);
      expect(shopEntries.length).toBe(plan.counts.overrideShop);
    });
  }

  it('places the vanilla prize on every prize slot, reported as locked vanilla', () => {
    const placement = generatePlacement('prize-vanilla', buildOptionsSnapshot({ dungeon_prize_shuffle: false }));
    const plan = buildPhysicalPlan(placement);
    const byLocation = new Map(plan.entries.map((entry) => [entry.location, entry]));

    expect(VANILLA_PRIZES.size).toBe(PRIZE_LOCATIONS.size);
    for (const [location, prize] of VANILLA_PRIZES) {
      expect(PRIZE_LOCATIONS.has(location)).toBe(true);
      expect(placement.locations[location]).toBe(prize);
      expect(byLocation.get(location)?.planClass).toBe('vanilla-locked');
    }
  });
});
