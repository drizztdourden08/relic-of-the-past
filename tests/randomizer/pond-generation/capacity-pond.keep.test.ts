/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { generatePlacement } from '@rotp/randomizer';
import { buildFillWorld } from '@rotp/randomizer';
import { fillOptionsFromSnapshot } from '@rotp/randomizer';
import { POND_PRIZE_LOCATIONS } from '@rotp/randomizer';
import { pondPlanOf } from '@rotp/randomizer';
import { createCollectionState } from '@rotp/randomizer';
import { WALLET } from '@rotp/randomizer';
import { reachableTopOf } from '@rotp/randomizer';
import { DELIVERABLE, EMPTY, MODES, SEEDS } from './pond-generation.constants';
import { snapshotOf } from './snapshot-of';

describe('pond generation', () => {
  for (const mode of MODES) {
    it(`${mode}: beatable over ${SEEDS.length} seeds with 6 pool items`, () => {
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
    const snapshot = snapshotOf({
      pond_capacity_mode: 'custom', pond_capacity_items: 2, pond_capacity_throws: 2, pond_capacity_ask_rupees_min: '900', pond_capacity_ask_rupees_max: '999',
      capacity_wallet_mode: 'custom', capacity_wallet_start: '0', capacity_wallet_max: '0',
      capacity_wallet_count: 1,
    });
    const fillWorld = buildFillWorld(fillOptionsFromSnapshot(
      snapshot, { capacity: DELIVERABLE }, {}, 'wallet-seed'));
    expect(fillWorld.ponds.capacity).toMatchObject({ mode: 'custom', start: 500, max: 500 });
    expect(pondPlanOf(fillWorld.ponds.capacity).throws.map((entry) => entry.price)).toEqual([500, 500]);
    const empty = createCollectionState(fillWorld.world);
    expect(fillWorld.pondLocations).toHaveLength(2);
    for (const name of fillWorld.pondLocations) {
      expect(fillWorld.world.getLocationRule(name)?.(empty), name).toBe(false);
    }
    const top = reachableTopOf(WALLET, fillWorld.capacity);
    for (const price of pondPlanOf(fillWorld.ponds.capacity).worstPriceOfPrize) {
      expect(price).toBeLessThanOrEqual(top);
    }
  }, 30_000);

  it('a custom range past the lowest wallet that rolls still generates, at the wallet\'s reach', () => {
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
});
