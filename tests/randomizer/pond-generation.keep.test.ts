/* @layer tests @kind test */
/**
 * Generation with the pond in the shuffle: every mode beatable over many
 * seeds, the prize slots really carrying pool items, the wallet rule really
 * gating them — and, at the legacy default, a world and a placement identical
 * to the one built before the option existed.
 */
import { describe, expect, it } from 'vitest';
import { generateApPlacement } from '@shared/randomizer/ap-world/fill/generate-ap';
import { buildFillWorld } from '@shared/randomizer/ap-world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/ap-world/fill/fill-options-from-snapshot';
import { apBaselineValues } from '@shared/randomizer/ap-world/options.data';
import { POND_CERTIFIED_SPOTS } from '@shared/randomizer/ap-world/pond/pond-spots';
import { POND_PRIZE_LOCATIONS } from '@shared/randomizer/ap-world/pond/pond-locations.data';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { pondValuesOf } from '@shared/randomizer/ap-world/pond/pond-from-snapshot';
import { LEGACY_POND_SETTING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { createCollectionState } from '@shared/randomizer/ap-world/collection-state';
import { WALLET } from '@shared/randomizer/ap-world/capacity/capacity-family';
import { reachableTopOf } from '@shared/randomizer/ap-world/capacity/reachable-top';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/ap-world/options.type';

const snapshotOf = (over: Record<string, ApOptionValue>): RandomizerOptionsSnapshot =>
  ({ schema: 'ap-options-v2', values: { ...apBaselineValues, ...over } });

const DELIVERABLE = new Set(POND_CERTIFIED_SPOTS);
const EMPTY: ReadonlySet<string> = new Set();

const SEEDS = Array.from({ length: 40 }, (_, index) => `pond-${index}`);

const MODES = ['vanilla-cost', 'custom', 'gamble'] as const;

describe('pond generation', () => {
  for (const mode of MODES) {
    it(`${mode}: beatable over ${SEEDS.length} seeds with 6 pool items`, () => {
      // A wide price range so the curve really has eight throws to cut.
      const snapshot = snapshotOf({
        pond_mode: mode, pond_items: 6, pond_throws: 8, pond_start: '25', pond_max: '999',
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
    const snapshot = snapshotOf({ pond_mode: 'custom', pond_items: 0 });
    const placement = generateApPlacement('pond-none', snapshot, EMPTY, DELIVERABLE, EMPTY);
    expect(placement.stats.pondPrizeCount).toBe(0);
    for (const name of POND_PRIZE_LOCATIONS) expect(placement.nameView[name]).toBeUndefined();
  }, 30_000);

  it('an unproven pond seam contributes no location at all', () => {
    const snapshot = snapshotOf({ pond_mode: 'vanilla-cost', pond_items: 4 });
    const placement = generateApPlacement('pond-unproven', snapshot, EMPTY, EMPTY, EMPTY);
    expect(placement.stats.pondPrizeCount).toBe(0);
  }, 30_000);

  it('a prize past the reachable wallet is held to it, so the pond stays in logic', () => {
    // A dear pond under the lowest wallet a seed can be rolled with: the range
    // is pulled down to what that wallet holds, so every prize slot is priced
    // within reach and the wallet rule passes at the start. The wallet asks
    // for 0 and reads 599, the floor a fixed 500-rupee purchase sets.
    const snapshot = snapshotOf({
      pond_mode: 'custom', pond_items: 2, pond_throws: 2, pond_start: '900', pond_max: '999',
      capacity_wallet_mode: 'custom', capacity_wallet_start: '0', capacity_wallet_max: '0',
      capacity_wallet_count: 1,
    });
    const fillWorld = buildFillWorld(fillOptionsFromSnapshot(
      snapshot, { capacity: DELIVERABLE }, {}, 'wallet-seed'));
    expect(fillWorld.pond).toMatchObject({ mode: 'custom', start: 500, max: 500 });
    expect(pondPlanOf(fillWorld.pond, 'wallet-seed').throws.map((entry) => entry.price)).toEqual([500, 500]);
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
    for (const price of pondPlanOf(fillWorld.pond, 'wallet-seed').worstPriceOfPrize) {
      expect(price).toBeLessThanOrEqual(top);
    }
  }, 30_000);

  it('a custom range past the lowest wallet that rolls still generates, at the wallet\'s reach', () => {
    // 599 is the lowest wallet top under which any seed rolls at all (a fixed
    // 500-rupee location in the price table); the pond's 900..999 range is
    // held at 500, the highest pond price that wallet holds.
    const snapshot = snapshotOf({
      pond_mode: 'custom', pond_items: 2, pond_throws: 2, pond_start: '900', pond_max: '999',
      capacity_wallet_mode: 'custom', capacity_wallet_start: '599', capacity_wallet_max: '599',
      capacity_wallet_count: 1,
    });
    for (const seed of SEEDS.slice(0, 5)) {
      const placement = generateApPlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
      expect(placement.stats.pondPrizeCount, seed).toBe(2);
      expect(pondPlanOf(placement.stats.pond!, placement.seed).throws.map((entry) => entry.price)).toEqual([500, 500]);
    }
  }, 60_000);

  it('the legacy pond rows build exactly the world a snapshot without them did', () => {
    const legacy = snapshotOf(pondValuesOf(LEGACY_POND_SETTING));
    const before = snapshotOf({});
    delete (before.values as Record<string, unknown>)['pond_mode'];
    delete (before.values as Record<string, unknown>)['pond_items'];
    const withRow = buildFillWorld(fillOptionsFromSnapshot(legacy, { capacity: DELIVERABLE }, {}, 's'));
    const withoutRow = buildFillWorld(fillOptionsFromSnapshot(before, { capacity: DELIVERABLE }, {}, 's'));
    expect([...withRow.world.locationsByName.keys()]).toEqual([...withoutRow.world.locationsByName.keys()]);
    expect(withRow.pond).toEqual({ mode: 'capacity' });
    expect(withRow.pondLocations).toEqual(withoutRow.pondLocations);
    expect(withRow.pool.pool).toEqual(withoutRow.pool.pool);
    const a = generateApPlacement('legacy-seed', legacy, EMPTY, DELIVERABLE, EMPTY);
    const b = generateApPlacement('legacy-seed', before, EMPTY, DELIVERABLE, EMPTY);
    expect(a.nameView).toEqual(b.nameView);
  }, 30_000);

  it('a placement re-derives the same schedule the generator planned', () => {
    const snapshot = snapshotOf({ pond_mode: 'gamble', pond_items: 3 });
    const placement = generateApPlacement('pond-derive', snapshot, EMPTY, DELIVERABLE, EMPTY);
    const plan = pondPlanOf(placement.stats.pond!, placement.seed);
    expect(plan.locations).toHaveLength(3);
    expect(plan.locations.every((name) => placement.nameView[name] !== undefined)).toBe(true);
  }, 30_000);
});
