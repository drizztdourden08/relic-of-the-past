/* @layer tests @kind test */
/**
 * No-silent-drop guard: every location a generated placement names must show
 * up in the physical plan, as an entry (a class the session acts on or
 * reports) or as an explicit error. Only the event slots may be absent; they
 * are logic constructs with no spot in the game. A location that is neither
 * planned nor reported is exactly the failure that let the shuffled dungeon
 * prizes disappear between generation and the session.
 *
 * Also pins that each prize slot holds its dungeon's vanilla prize, so the
 * spoiler, the pool listing, the tracker and the logic agree with the game.
 *
 * And the same guard over the rename a stored placement is read through: a
 * location name lives in four maps, and rewriting only two of them once left
 * every pond rung of a live seed with no demand, so the fairy asked for
 * nothing and handed her prizes over free. A missing demand reads as no
 * demand, which is why nothing failed loudly.
 */
import { describe, expect, it } from 'vitest';
import { generateApPlacement } from '@shared/randomizer/ap-world/fill/generate-ap';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { EVENT_LOCATIONS, PRIZE_LOCATIONS } from '@shared/randomizer/ap-world/special-locations.data';
import { VANILLA_PRIZES } from '@shared/randomizer/ap-world/vanilla-prizes.data';
import { isShopSlotLocation } from '@shared/randomizer/ap-world/shops/shop-slots';
import { STANDARD_SHOP_SLOT_COUNT } from '@shared/randomizer/ap-world/shops/shops.data';
import { SHOP_MODE_KEY, SHOP_SLOT_ROWS } from '@shared/randomizer/ap-world/shops/shop-slot-options.data';
import { renamePondLocations } from '@app/lib/randomizer-placement-names';
import { POND_CERTIFIED_SPOTS } from '@shared/randomizer/ap-world/pond/pond-spots';
import { POND_INSTANCES } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { POND_RUNGS_BY_ID } from '@shared/randomizer/ap-world/pond/pond-locations.data';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { ApOptionValue } from '@shared/randomizer/ap-world/options.type';

// The bridge chain pulls in log-bus, which wires window handlers at import
// time; this suite runs in node, so a stand-in goes in before the dynamic import.
(globalThis as { window?: unknown }).window ??= { addEventListener: () => undefined };
const { buildPhysicalPlan } = await import('@app/lib/game/randomizer-client/ap-bridge');

const DELIVERABLE_NPC: ReadonlySet<string> = new Set([
  'King Zora', 'Sahasrahla', 'Old Man', 'Eastern Palace - Boss',
]);
const DELIVERABLE_WORLD: ReadonlySet<string> = new Set([
  'Library', 'Bombos Tablet', 'Desert Palace - Torch', 'Sunken Treasure',
]);

/** Every slot ticked, the hut and the bomb counter included. */
const EVERY_SHOP_SLOT: Record<string, ApOptionValue> =
  Object.fromEntries(SHOP_SLOT_ROWS.map((row) => [row.key, true]));

interface OptionSet {
  name: string;
  overrides: Record<string, ApOptionValue>;
  npc?: ReadonlySet<string>;
  world?: ReadonlySet<string>;
}

const OPTION_SETS: readonly OptionSet[] = [
  { name: 'fresh defaults, nothing deliverable', overrides: {} },
  {
    name: 'key drops + npc + world items on',
    overrides: { key_drop_shuffle: true, include_npc_checks: true, include_world_items: true },
    npc: DELIVERABLE_NPC,
    world: DELIVERABLE_WORLD,
  },
  // Shop slots have no check record, so they are the case most likely to be
  // dropped between generation and the session. Every mode is pinned, and both
  // depths, because each mode chooses a different set of slots and the hut and
  // the bomb counter reach the plan through seams of their own.
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
      const placement = generateApPlacement(`plan-coverage-${name}`, snapshot, npc, undefined, world);
      const plan = buildPhysicalPlan(placement);

      const covered = new Set<string>([
        ...plan.entries.map((entry) => entry.locationName),
        ...plan.errors.map((error) => error.locationName),
      ]);
      const dropped = Object.keys(placement.nameView)
        .filter((location) => !EVENT_LOCATIONS.has(location) && !covered.has(location));
      expect(dropped).toEqual([]);
      // A shelf slot must be a real physical entry, never an error row.
      expect(plan.errors.filter((error) => isShopSlotLocation(error.locationName))).toEqual([]);
      const shopEntries = plan.entries.filter((entry) => isShopSlotLocation(entry.locationName));
      expect(shopEntries.every((entry) => entry.planClass === 'override-shop')).toBe(true);
      expect(shopEntries.length).toBe(plan.counts.overrideShop);
    });
  }

  it('places the vanilla prize on every prize slot, reported as locked vanilla', () => {
    const placement = generateApPlacement('prize-vanilla', buildOptionsSnapshot({ dungeon_prize_shuffle: false }));
    const plan = buildPhysicalPlan(placement);
    const byLocation = new Map(plan.entries.map((entry) => [entry.locationName, entry]));

    expect(VANILLA_PRIZES.size).toBe(PRIZE_LOCATIONS.size);
    for (const [location, prize] of VANILLA_PRIZES) {
      expect(PRIZE_LOCATIONS.has(location)).toBe(true);
      expect(placement.nameView[location]).toBe(prize);
      expect(byLocation.get(location)?.planClass).toBe('vanilla-locked');
    }
  });
});

const NO_LOCATIONS: ReadonlySet<string> = new Set();

describe('a placement stored under the old pond names', () => {
  /** The stems the rungs were numbered under before the fairies were named. */
  const SHIPPED_STEMS: Readonly<Record<string, string>> = {
    capacity: 'Capacity Upgrade Pond', wishing: 'Wishing Pond', cursed: 'Cursed Pond',
  };

  /** Today's rung name back under the stem a frozen seed on disk carries. */
  const asShipped = (location: string): string => {
    for (const pond of POND_INSTANCES) {
      const rung = POND_RUNGS_BY_ID[pond.id].indexOf(location);
      if (rung !== -1) return `${SHIPPED_STEMS[pond.id]} ${rung + 1}`;
    }
    return location;
  };

  const keyedBack = <T>(view: Readonly<Record<string, T>>): Record<string, T> =>
    Object.fromEntries(Object.entries(view).map(([location, value]) => [asShipped(location), value]));

  const stored = (placement: ApPlacement): ApPlacement => ({
    ...placement,
    nameView: keyedBack(placement.nameView),
    pondDemands: placement.pondDemands === undefined ? undefined : keyedBack(placement.pondDemands),
    spheres: placement.spheres.map((sphere) => ({ ...sphere, locations: sphere.locations.map(asShipped) })),
  });

  // The pond's seam has to be certified, or it contributes no location at all
  // and the rungs this guard is about never exist.
  const pondSeed = (): ApPlacement => generateApPlacement('pond-demands', buildOptionsSnapshot({
    pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 6,
    pond_capacity_ask_rupees_min: '25', pond_capacity_ask_rupees_max: '300',
    pond_capacity_ask_bombs: true, pond_capacity_ask_bombs_min: 5, pond_capacity_ask_bombs_max: 10,
    // Only this pond's seam is certified here, so the two wish ponds stay out.
    pond_wishing_mode: 'capacity', pond_cursed_mode: 'capacity',
  }), NO_LOCATIONS, new Set(POND_CERTIFIED_SPOTS), NO_LOCATIONS);

  it('reads back byte-identical, demands included', () => {
    expect(POND_RUNGS_BY_ID.capacity.filter((rung) => pondSeed().nameView[rung] !== undefined)).toHaveLength(4);
    const fresh = pondSeed();
    expect(Object.keys(fresh.pondDemands ?? {}).length).toBeGreaterThan(0);
    expect(renamePondLocations(stored(fresh))).toEqual(fresh);
  });

  it('leaves no rung holding an item with its demand lost behind an old name', () => {
    const migrated = renamePondLocations(stored(pondSeed()));
    const placed = new Set(Object.keys(migrated.nameView));
    const rungs = new Set(POND_INSTANCES.flatMap((pond) => POND_RUNGS_BY_ID[pond.id]));
    const orphaned = Object.keys(migrated.pondDemands ?? {})
      .filter((location) => !rungs.has(location) || !placed.has(location));
    expect(orphaned).toEqual([]);
  });
});
