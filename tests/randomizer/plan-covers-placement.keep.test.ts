/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { generatePlacement, buildOptionsSnapshot, PRIZE_LOCATIONS, VANILLA_PRIZES, isShopSlotLocation, STANDARD_SHOP_SLOT_COUNT, SHOP_MODE_KEY, SHOP_SLOT_ROWS } from '@rotp/randomizer';
import type { OptionValue, LocationKey } from '@rotp/randomizer';

(globalThis as { window?: unknown }).window ??= { addEventListener: () => undefined };
const { buildPhysicalPlan } = await import('../../packages/randomizer/src/client/placement-bridge');

const DELIVERABLE_NPC: ReadonlySet<LocationKey> = new Set<LocationKey>([
  'check-019', 'check-033', 'check-060', 'check-121',
]);
const DELIVERABLE_WORLD: ReadonlySet<LocationKey> = new Set<LocationKey>([
  'check-055', 'check-080', 'check-126', 'check-009',
]);

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
