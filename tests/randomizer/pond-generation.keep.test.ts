/* @layer tests @kind test */
/**
 * Generation with the pond in the shuffle: every slot a real location of the world named for its
 * pond and its number, every mode beatable over many seeds, the prize slots really carrying pool
 * items, and the wallet rule really gating them.
 *
 * The last block is the one the options panel stands on: the demands a seed
 * asks for are drawn from the SEED, so what the panel previews before
 * generation is byte for byte what the placement carries, retries included.
 */
import { locationDisplayName } from '@shared/randomizer/world/display-names/location-display-name';
import { ITEM } from '@shared/randomizer/world/item-ids.data';
import { describe, expect, it } from 'vitest';
import { generatePlacement } from '@shared/randomizer/world/fill/generate';
import { pondDemandsOfSnapshot } from '@shared/randomizer/world/fill/pond-demands-of-snapshot';
import { buildFillWorld } from '@shared/randomizer/world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import { baselineValues } from '@shared/randomizer/world/options.data';
import { POND_CERTIFIED_SPOTS } from '@shared/randomizer/world/pond/pond-spots';
import { POND_PRIZE_LOCATIONS } from '@shared/randomizer/world/pond/pond-rungs';
import { pondPlanOf } from '@shared/randomizer/world/pond/pond-plan';
import { parsePondProfiles } from '@shared/randomizer/world/pond/pond-profiles-from-snapshot';
import { createCollectionState } from '@shared/randomizer/world/collection-state';
import { WALLET } from '@shared/randomizer/world/capacity/capacity-family';
import { reachableTopOf } from '@shared/randomizer/world/capacity/reachable-top';
import { POND_INSTANCES } from '@shared/randomizer/world/pond/pond-instances';
import { POND_RUNGS_BY_ID } from '@shared/randomizer/world/pond/pond-rungs';
import { POND_REGION_LOCATIONS } from '@shared/randomizer/world/pond/pond-region-locations';
import { find } from '@shared/game/data';
import { NPC_SCOPE_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import type { OptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';

const snapshotOf = (over: Record<string, OptionValue>): RandomizerOptionsSnapshot =>
  ({ schema: 'ap-options-v2', values: { ...baselineValues, ...over } });

const DELIVERABLE = new Set(POND_CERTIFIED_SPOTS);
const EMPTY: ReadonlySet<string> = new Set();

const ALL_POND_SLOTS = new Set(POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => slot.key)));
const ALL_NPC = new Set(NPC_SCOPE_LOCATIONS.keys());

const SEEDS = Array.from({ length: 40 }, (_, index) => `pond-${index}`);

const MODES = ['vanilla-cost', 'custom'] as const;

describe('pond slot identity', () => {
  it('every pond slot is a location of the world', () => {
    const declared = new Set([...POND_REGION_LOCATIONS.values()].flat());
    for (const pond of POND_INSTANCES) {
      for (const slot of pond.slots) {
        expect(declared.has(slot.key), `${pond.label}: ${slot.key}`).toBe(true);
      }
    }
  });

  it('every slot is its pond and a number, never a side', () => {
    expect(POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => slot.key))).toEqual([
      'check-273', 'check-274',
      'check-021', 'check-022',
      'check-266', 'check-267',
    ]);
    // The names the keys read as, which is where the pond and the number live.
    expect(POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => locationDisplayName(slot.key)))).toEqual([
      'Hylia Fairy Bombs 1', 'Hylia Fairy Arrows 1',
      'Waterfall Fairy 1', 'Waterfall Fairy 2',
      'Pyramid Fairy 1', 'Pyramid Fairy 2',
    ]);
  });

  // A wish pond's own pair IS rungs 1 and 2 of her ladder, so a check record answers to those
  // two names. The capacity pond answers in two named family ladders instead, so none of its
  // plain rungs may be a record's name: a tier and a rung would share one.
  it('a wish pond pair is rungs 1 and 2, and no record answers to a prize rung', () => {
    const recordIds = new Set(find('check', () => true).map((check) => check.id as string));
    for (const pond of POND_INSTANCES) {
      const rungs = POND_RUNGS_BY_ID[pond.id];
      const pair = pond.slots.map((slot) => slot.key);
      const asRungs = pond.id === 'capacity' ? [] : [rungs[0], rungs[1]];
      expect(pair.filter((key) => rungs.includes(key)), pond.label).toEqual(asRungs);
      expect(pair.filter((key) => !recordIds.has(key)), pond.label).toEqual([]);
      expect(rungs.slice(asRungs.length).filter((key) => recordIds.has(key)), pond.label).toEqual([]);
    }
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
        const placement = generatePlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
        expect(placement.stats.pondPrizeCount, seed).toBe(6);
        const prizes = POND_PRIZE_LOCATIONS.slice(0, 6);
        for (const name of prizes) {
          expect(placement.locations[name], `${seed} ${name}`).toBeTruthy();
        }
        // The sweep inside the generator already proved full accessibility and
        // the goal; a placement that came back at all is beatable.
        expect(placement.spheres.length, seed).toBeGreaterThan(0);
      }
    }, 30_000);
  }

  it('zero pool items leaves the pond out of the world entirely', () => {
    const snapshot = snapshotOf({ pond_capacity_mode: 'custom', pond_capacity_items: 0 });
    const placement = generatePlacement('pond-none', snapshot, EMPTY, DELIVERABLE, EMPTY);
    expect(placement.stats.pondPrizeCount).toBe(0);
    for (const name of POND_PRIZE_LOCATIONS) expect(placement.locations[name]).toBeUndefined();
  }, 30_000);

  it('an unproven pond seam contributes no location at all', () => {
    const snapshot = snapshotOf({ pond_capacity_mode: 'vanilla-cost', pond_capacity_items: 4 });
    const placement = generatePlacement('pond-unproven', snapshot, EMPTY, EMPTY, EMPTY);
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
      const placement = generatePlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
      expect(placement.stats.pondPrizeCount, seed).toBe(2);
      expect(pondPlanOf(placement.stats.ponds.capacity).throws.map((entry) => entry.price)).toEqual([500, 500]);
    }
  }, 60_000);

  it('a placement re-derives the same schedule the generator planned', () => {
    const snapshot = snapshotOf({ pond_capacity_mode: 'custom', pond_capacity_items: 3, pond_capacity_throws: 5 });
    const placement = generatePlacement('pond-derive', snapshot, EMPTY, DELIVERABLE, EMPTY);
    const plan = pondPlanOf(placement.stats.ponds.capacity);
    expect(plan.locations).toHaveLength(3);
    expect(plan.locations.every((name) => placement.locations[name] !== undefined)).toBe(true);
  }, 30_000);

  for (const pond of POND_INSTANCES.filter((entry) => entry.id !== 'capacity')) {
    const slots = pond.slots.map((slot) => slot.key);
    const worldOf = (mode: string, flag: boolean) => buildFillWorld({
      ...fillOptionsFromSnapshot(snapshotOf({
        [`pond_${pond.id}_mode`]: mode, [`pond_${pond.id}_items`]: 4, [`pond_${pond.id}_throws`]: 4,
      }), { npc: ALL_NPC, capacity: ALL_POND_SLOTS }, {}, 's'),
      pondSlotsFollowMode: flag,
    });
    // Her pair IS rungs 1 and 2, so the candidates are her ladder and nothing besides.
    const candidates = [...new Set([...slots, ...POND_RUNGS_BY_ID[pond.id]])];
    const present = (mode: string, flag = true): string[] => candidates
      .filter((name) => worldOf(mode, flag).world.locationsByKey.has(name));

    it(`${pond.label} at Vanilla grants locks both slots to what her upgrade produces`, () => {
      const locked = worldOf('capacity', true);
      expect(present('capacity')).toEqual(slots);
      for (const slot of pond.slots) expect(locked.lockedVanilla.get(slot.key), slot.key).toBe(slot.vanillaGrant);
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
      // Which slots exist is the pond's own ladder, so the vanilla-grant flag cannot move it.
      expect(present('custom', false)).toEqual(POND_RUNGS_BY_ID[pond.id].slice(0, 4));
      const snapshot = snapshotOf({ [`pond_${pond.id}_mode`]: 'custom', [`pond_${pond.id}_items`]: 4 });
      const placement = generatePlacement(`closed-${pond.id}`, snapshot, ALL_NPC, ALL_POND_SLOTS, EMPTY);
      // Her pair is prizes 1 and 2 of the ladder here, so both carry what the seed put there.
      for (const name of slots) expect(placement.locations[name], name).toBeDefined();
      for (const name of POND_RUNGS_BY_ID[pond.id].slice(4)) {
        expect(placement.locations[name], name).toBeUndefined();
      }
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
    const placement = generatePlacement('pond-shared', snapshotOf({ ...separate, pond_share: true }), EMPTY, DELIVERABLE, EMPTY);
    expect(placement.stats.pondPrizeCount).toBeGreaterThan(0);
  }, 30_000);

  it('Vanilla grants with the npc switch off keeps a Blue Boomerang to throw', () => {
    // The Brewery lock takes the pool's only Red Boomerang, so the second red (hers)
    // displaces a filler, never the blue one she needs.
    const snapshot = snapshotOf({ include_npc_checks: false, pond_wishing_mode: 'capacity' });
    const { pool, lockedVanilla } = buildFillWorld(fillOptionsFromSnapshot(snapshot, { capacity: ALL_POND_SLOTS }, {}, 's'));
    expect(pool.pool.filter((item) => item === ITEM.blueBoomerang)).toHaveLength(1);
    expect(pool.pool.filter((item) => item === ITEM.redBoomerang)).toHaveLength(0);
    expect([lockedVanilla.get('check-268'), lockedVanilla.get('check-021')])
      .toEqual([ITEM.redBoomerang, ITEM.redBoomerang]);
    const placement = generatePlacement('double-red', snapshot, EMPTY, ALL_POND_SLOTS, EMPTY);
    expect(Object.values(placement.locations)).toContain(ITEM.blueBoomerang);
  }, 30_000);
});

/** A custom pond with every ask row ticked: the ladder a preview has to get right. */
const MIXED_ASK: Record<string, OptionValue> = {
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
      const placement = generatePlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
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
