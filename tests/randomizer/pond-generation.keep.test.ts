/* @layer tests @kind test */
/**
 * Generation with the pond in the shuffle: the slot names an online server
 * answers to, every mode beatable over many
 * seeds, the prize slots really carrying pool items, the wallet rule really
 * gating them, and, at the legacy default, a world and a placement identical
 * to the one built before the option existed.
 *
 * The last block is the one the options panel stands on: the demands a seed
 * asks for are drawn from the SEED, so what the panel previews before
 * generation is byte for byte what the placement carries, retries included.
 */
import { describe, expect, it } from 'vitest';
import { generateApPlacement } from '@shared/randomizer/ap-world/fill/generate-ap';
import { pondDemandsOfSnapshot } from '@shared/randomizer/ap-world/fill/pond-demands-of-snapshot';
import { buildFillWorld } from '@shared/randomizer/ap-world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/ap-world/fill/fill-options-from-snapshot';
import { apBaselineValues } from '@shared/randomizer/ap-world/options.data';
import { POND_CERTIFIED_SPOTS } from '@shared/randomizer/ap-world/pond/pond-spots';
import { POND_OPTION_KEYS } from '@shared/randomizer/ap-world/pond/pond-option-keys';
import { POND_PRIZE_LOCATIONS } from '@shared/randomizer/ap-world/pond/pond-locations.data';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import {
  parsePondProfiles, pondProfileValuesOf,
} from '@shared/randomizer/ap-world/pond/pond-profiles-from-snapshot';
import { pondProfilesOfStats } from '@shared/randomizer/ap-world/fill/placement-ponds';
import { LEGACY_POND_PROFILES } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { createCollectionState } from '@shared/randomizer/ap-world/collection-state';
import { WALLET } from '@shared/randomizer/ap-world/capacity/capacity-family';
import { reachableTopOf } from '@shared/randomizer/ap-world/capacity/reachable-top';
import { POND_INSTANCES } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { POND_RUNGS_BY_ID } from '@shared/randomizer/ap-world/pond/pond-locations.data';
import { find } from '@shared/game/data';
import { locationDisplayName } from '@shared/randomizer/ap-world/display-names';
import AP_DATAPACKAGE from '@shared/randomizer/ap-world/alttp-datapackage.json';
import { NPC_SCOPE_LOCATIONS } from '@shared/randomizer/ap-world/scope-vanilla.data';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/ap-world/options.type';

const snapshotOf = (over: Record<string, ApOptionValue>): RandomizerOptionsSnapshot =>
  ({ schema: 'ap-options-v2', values: { ...apBaselineValues, ...over } });

const DELIVERABLE = new Set(POND_CERTIFIED_SPOTS);
const EMPTY: ReadonlySet<string> = new Set();

const ALL_POND_SLOTS = new Set(POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => slot.location)));
const ALL_NPC = new Set(NPC_SCOPE_LOCATIONS.keys());

const SEEDS = Array.from({ length: 40 }, (_, index) => `pond-${index}`);

const MODES = ['vanilla-cost', 'custom'] as const;

describe('pond slot identity', () => {
  const serverLocations = AP_DATAPACKAGE.location_name_to_id as Record<string, number>;

  it('every pond slot is named exactly as the server names it', () => {
    for (const pond of POND_INSTANCES) {
      for (const slot of pond.slots) {
        expect(serverLocations[slot.location], `${pond.label}: ${slot.location}`).toBeTypeOf('number');
      }
    }
  });

  it('a player reads the pond and a number, never a side', () => {
    const shown = POND_INSTANCES.flatMap(
      (pond) => pond.slots.map((slot) => locationDisplayName(slot.location)));
    expect(shown).toEqual([
      'Hylia Fairy Bombs 1', 'Hylia Fairy Arrows 1',
      'Waterfall Fairy 1', 'Waterfall Fairy 2',
      'Pyramid Fairy 1', 'Pyramid Fairy 2',
    ]);
  });

  it('no check answers to a pond rung name, so a tier and a rung never share one', () => {
    const rungs = new Set(POND_INSTANCES.flatMap((pond) => POND_RUNGS_BY_ID[pond.id]));
    const clashing = find('check', () => true)
      .map((check) => check.randomizerName)
      .filter((name) => rungs.has(name));
    expect(clashing).toEqual([]);
  });
});

describe('pond generation', () => {
  for (const mode of MODES) {
    it(`${mode}: beatable over ${SEEDS.length} seeds with 6 pool items`, () => {
      // A wide price range so the curve really has eight throws to cut.
      const snapshot = snapshotOf({
        pond_capacity_mode: mode, pond_capacity_items: 6, pond_capacity_throws: 8, pond_capacity_start: '25', pond_capacity_max: '999',
      });
      for (const seed of SEEDS) {
        const placement = generateApPlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
        expect(placement.stats.pondPrizeCount, seed).toBe(6);
        const prizes = POND_PRIZE_LOCATIONS.slice(0, 6);
        for (const name of prizes) {
          expect(placement.nameView[name], `${seed} ${name}`).toBeTruthy();
        }
        // The sweep inside the generator already proved full accessibility and
        // the goal; a placement that came back at all is beatable.
        expect(placement.spheres.length, seed).toBeGreaterThan(0);
      }
    }, 30_000);
  }

  it('zero pool items leaves the pond out of the world entirely', () => {
    const snapshot = snapshotOf({ pond_capacity_mode: 'custom', pond_capacity_items: 0 });
    const placement = generateApPlacement('pond-none', snapshot, EMPTY, DELIVERABLE, EMPTY);
    expect(placement.stats.pondPrizeCount).toBe(0);
    for (const name of POND_PRIZE_LOCATIONS) expect(placement.nameView[name]).toBeUndefined();
  }, 30_000);

  it('an unproven pond seam contributes no location at all', () => {
    const snapshot = snapshotOf({ pond_capacity_mode: 'vanilla-cost', pond_capacity_items: 4 });
    const placement = generateApPlacement('pond-unproven', snapshot, EMPTY, EMPTY, EMPTY);
    expect(placement.stats.pondPrizeCount).toBe(0);
  }, 30_000);

  it('a prize past the reachable wallet is held to it, so the pond stays in logic', () => {
    // A dear pond under the lowest wallet a seed can be rolled with: the range
    // is pulled down to what that wallet holds, so every prize slot is priced
    // within reach and the wallet rule passes at the start. The wallet asks
    // for 0 and reads 599, the floor a fixed 500-rupee purchase sets.
    const snapshot = snapshotOf({
      pond_capacity_mode: 'custom', pond_capacity_items: 2, pond_capacity_throws: 2, pond_capacity_ask_rupees_min: '900', pond_capacity_ask_rupees_max: '999',
      capacity_wallet_mode: 'custom', capacity_wallet_start: '0', capacity_wallet_max: '0',
      capacity_wallet_count: 1,
    });
    const fillWorld = buildFillWorld(fillOptionsFromSnapshot(
      snapshot, { capacity: DELIVERABLE }, {}, 'wallet-seed'));
    expect(fillWorld.ponds.capacity).toMatchObject({ mode: 'custom', start: 500, max: 500 });
    expect(pondPlanOf(fillWorld.ponds.capacity).throws.map((entry) => entry.price)).toEqual([500, 500]);
    // The wallet starts empty and climbs on its one upgrade, so the prizes are
    // out of reach until it is collected and in reach afterwards. That is the
    // property worth pinning: the pond never asks for more than the wallet can
    // ever hold, not that it asks for nothing.
    const empty = createCollectionState(fillWorld.world);
    expect(fillWorld.pondLocations).toHaveLength(2);
    for (const name of fillWorld.pondLocations) {
      expect(fillWorld.world.getLocationRule(name)?.(empty), name).toBe(false);
    }
    // And no throw asks for more than this wallet can ever hold, which is what
    // keeps the prizes reachable once it has climbed.
    const top = reachableTopOf(WALLET, fillWorld.capacity);
    for (const price of pondPlanOf(fillWorld.ponds.capacity).worstPriceOfPrize) {
      expect(price).toBeLessThanOrEqual(top);
    }
  }, 30_000);

  it('a custom range past the lowest wallet that rolls still generates, at the wallet\'s reach', () => {
    // 599 is the lowest wallet top under which any seed rolls at all (a fixed
    // 500-rupee location in the price table); the pond's 900..999 range is
    // held at 500, the highest pond price that wallet holds.
    const snapshot = snapshotOf({
      pond_capacity_mode: 'custom', pond_capacity_items: 2, pond_capacity_throws: 2, pond_capacity_ask_rupees_min: '900', pond_capacity_ask_rupees_max: '999',
      capacity_wallet_mode: 'custom', capacity_wallet_start: '599', capacity_wallet_max: '599',
      capacity_wallet_count: 1,
    });
    for (const seed of SEEDS.slice(0, 5)) {
      const placement = generateApPlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
      expect(placement.stats.pondPrizeCount, seed).toBe(2);
      expect(pondPlanOf(pondProfilesOfStats(placement.stats).capacity).throws.map((entry) => entry.price)).toEqual([500, 500]);
    }
  }, 60_000);

  it('the legacy pond rows build exactly the world a snapshot without them did', () => {
    const legacy = snapshotOf(pondProfileValuesOf(LEGACY_POND_PROFILES));
    const before = snapshotOf({});
    for (const key of POND_OPTION_KEYS) delete (before.values as Record<string, unknown>)[key];
    const withRow = buildFillWorld(fillOptionsFromSnapshot(legacy, { capacity: DELIVERABLE }, {}, 's'));
    const withoutRow = buildFillWorld(fillOptionsFromSnapshot(before, { capacity: DELIVERABLE }, {}, 's'));
    expect([...withRow.world.locationsByName.keys()]).toEqual([...withoutRow.world.locationsByName.keys()]);
    expect(withRow.ponds.capacity).toEqual({ mode: 'capacity' });
    expect(withRow.pondLocations).toEqual(withoutRow.pondLocations);
    expect(withRow.pool.pool).toEqual(withoutRow.pool.pool);
    const a = generateApPlacement('legacy-seed', legacy, EMPTY, DELIVERABLE, EMPTY);
    const b = generateApPlacement('legacy-seed', before, EMPTY, DELIVERABLE, EMPTY);
    expect(a.nameView).toEqual(b.nameView);
  }, 30_000);

  it('a placement re-derives the same schedule the generator planned', () => {
    const snapshot = snapshotOf({ pond_capacity_mode: 'custom', pond_capacity_items: 3, pond_capacity_throws: 5 });
    const placement = generateApPlacement('pond-derive', snapshot, EMPTY, DELIVERABLE, EMPTY);
    const plan = pondPlanOf(pondProfilesOfStats(placement.stats).capacity);
    expect(plan.locations).toHaveLength(3);
    expect(plan.locations.every((name) => placement.nameView[name] !== undefined)).toBe(true);
  }, 30_000);

  for (const pond of POND_INSTANCES.filter((entry) => entry.id !== 'capacity')) {
    const slots = pond.slots.map((slot) => slot.location);
    const worldOf = (mode: string, flag: boolean) => buildFillWorld({
      ...fillOptionsFromSnapshot(snapshotOf({
        [`pond_${pond.id}_mode`]: mode, [`pond_${pond.id}_items`]: 4, [`pond_${pond.id}_throws`]: 4,
      }), { npc: ALL_NPC, capacity: ALL_POND_SLOTS }, {}, 's'),
      pondSlotsFollowMode: flag,
    });
    const present = (mode: string, flag = true): string[] => [...slots, ...POND_RUNGS_BY_ID[pond.id]]
      .filter((name) => worldOf(mode, flag).world.locationsByName.has(name));

    it(`${pond.label} at Vanilla grants locks both slots to what her upgrade produces`, () => {
      const locked = worldOf('capacity', true);
      expect(present('capacity')).toEqual(slots);
      for (const slot of pond.slots) expect(locked.lockedVanilla.get(slot.location), slot.location).toBe(slot.vanillaGrant);
      // Exactly the produced items leave the pool; what she takes in trade stays findable.
      const open = worldOf('vanilla-cost', true).pool.pool;
      const produced = pond.slots.map((slot) => slot.vanillaGrant as string).sort();
      const removed = [...open];
      for (const item of locked.pool.pool) removed.splice(removed.indexOf(item), 1);
      expect(removed.sort()).toEqual(produced);
      expect(slots.some((name) => worldOf('capacity', false).lockedVanilla.has(name))).toBe(false);
    });

    it(`${pond.label} at Vanilla cost keeps both slots as open checks`, () => {
      expect(present('vanilla-cost')).toEqual(slots);
      expect(slots.some((name) => worldOf('vanilla-cost', true).lockedVanilla.has(name))).toBe(false);
    });

    it(`${pond.label} under Custom carries exactly its rungs and still rolls`, () => {
      expect(present('custom')).toEqual(POND_RUNGS_BY_ID[pond.id].slice(0, 4));
      expect(present('custom', false)).toEqual([...slots, ...POND_RUNGS_BY_ID[pond.id].slice(0, 4)]);
      const snapshot = snapshotOf({ [`pond_${pond.id}_mode`]: 'custom', [`pond_${pond.id}_items`]: 4 });
      const placement = generateApPlacement(`closed-${pond.id}`, snapshot, ALL_NPC, ALL_POND_SLOTS, EMPTY);
      for (const name of slots) expect(placement.nameView[name], name).toBeUndefined();
    }, 30_000);
  }

  it('the shared switch gives all three ponds the capacity pond settings', () => {
    // The generator reads the resolution, so a shared seed builds the wish
    // ponds' rungs from the capacity pond's ladder and not from their own rows.
    const separate = {
      pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 4,
      pond_wishing_mode: 'vanilla-cost', pond_cursed_mode: 'capacity',
    };
    const off = fillOptionsFromSnapshot(snapshotOf(separate), { capacity: ALL_POND_SLOTS }, {}, 's');
    expect(off.ponds.wishing).toMatchObject({ mode: 'vanilla-cost' });
    expect(off.ponds.cursed).toEqual({ mode: 'capacity' });
    const on = fillOptionsFromSnapshot(
      snapshotOf({ ...separate, pond_share: true }), { capacity: ALL_POND_SLOTS }, {}, 's');
    for (const pond of POND_INSTANCES) expect(on.ponds[pond.id], pond.id).toEqual(on.ponds.capacity);
    expect(on.ponds.capacity).toEqual(off.ponds.capacity);
    // The rows each pond holds are untouched, so the switch is reversible.
    expect(parsePondProfiles(snapshotOf({ ...separate, pond_share: true }).values).stored)
      .toEqual(parsePondProfiles(snapshotOf(separate).values).profiles);
    const placement = generateApPlacement('pond-shared', snapshotOf({ ...separate, pond_share: true }), EMPTY, DELIVERABLE, EMPTY);
    expect(placement.stats.pondPrizeCount).toBeGreaterThan(0);
  }, 30_000);

  it('Vanilla grants with the npc switch off keeps a Blue Boomerang to throw', () => {
    // The Brewery lock takes the pool's only Red Boomerang, so the second red (hers)
    // displaces a filler, never the blue one she needs.
    const snapshot = snapshotOf({ include_npc_checks: false, pond_wishing_mode: 'capacity' });
    const { pool, lockedVanilla } = buildFillWorld(fillOptionsFromSnapshot(snapshot, { capacity: ALL_POND_SLOTS }, {}, 's'));
    expect(pool.pool.filter((name) => name === 'Blue Boomerang')).toHaveLength(1);
    expect(pool.pool.filter((name) => name === 'Red Boomerang')).toHaveLength(0);
    expect([lockedVanilla.get('Brewery'), lockedVanilla.get('Waterfall Fairy - Left')]).toEqual(['Red Boomerang', 'Red Boomerang']);
    const placement = generateApPlacement('double-red', snapshot, EMPTY, ALL_POND_SLOTS, EMPTY);
    expect(Object.values(placement.nameView)).toContain('Blue Boomerang');
  }, 30_000);
});

/** A custom pond with every ask row ticked: the ladder a preview has to get right. */
const MIXED_ASK: Record<string, ApOptionValue> = {
  pond_capacity_mode: 'custom', pond_capacity_items: 6, pond_capacity_throws: 8,
  pond_capacity_start: '25', pond_capacity_max: '999',
  pond_capacity_ask_rupees: true,
  pond_capacity_ask_bombs: true, pond_capacity_ask_bombs_min: '1', pond_capacity_ask_bombs_max: '10',
  pond_capacity_ask_arrows: true, pond_capacity_ask_arrows_min: '1', pond_capacity_ask_arrows_max: '30',
  pond_capacity_ask_bottle: true, pond_capacity_ask_bottle_min: '1', pond_capacity_ask_bottle_max: '3',
  pond_capacity_ask_item: true,
  // The two wish ponds stay out, so every rolled rung belongs to this ladder.
  pond_wishing_mode: 'capacity', pond_cursed_mode: 'capacity',
};

describe('pond demands come from the seed, so a preview cannot lie', () => {
  const snapshot = snapshotOf(MIXED_ASK);
  const previewSeeds = SEEDS.slice(0, 12);

  it('what the panel would show is what the placement carries, retries included', () => {
    const retried: string[] = [];
    for (const seed of previewSeeds) {
      const placement = generateApPlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
      // The panel calls this same function, with the same probe sets, before
      // any placement exists.
      const previewed = pondDemandsOfSnapshot(snapshot, seed, { capacity: DELIVERABLE });
      expect(previewed, seed).toEqual(placement.pondDemands);
      if (placement.stats.attempts > 1) retried.push(seed);
    }
    // A seed that needed a second attempt is the case the roll used to get
    // wrong. Pick fresh seeds here if the fill ever stops retrying on these.
    expect(retried.length, 'no seed in this set retried').toBeGreaterThan(0);
  }, 60_000);

  it('an attempt seed never reaches the roll', () => {
    const seed = previewSeeds[0];
    const settled = pondDemandsOfSnapshot(snapshot, seed, { capacity: DELIVERABLE });
    // The shape a retry derives. Rolling on it would have moved every rung,
    // which is why the equality above is worth pinning.
    expect(pondDemandsOfSnapshot(snapshot, `${seed}#retry1`, { capacity: DELIVERABLE })).not.toEqual(settled);
    expect(Object.keys(settled)).toEqual(POND_PRIZE_LOCATIONS.slice(0, 6));
  });
});
