/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { generatePlacement } from '@rotp/randomizer';
import { pondDemandsOfSnapshot } from '@rotp/randomizer';
import { POND_PRIZE_LOCATIONS } from '@rotp/randomizer';
import { DELIVERABLE, EMPTY, MIXED_ASK, SEEDS } from './pond-generation.constants';
import { snapshotOf } from './snapshot-of';

describe('pond demands come from the seed, so a preview cannot lie', () => {
  const snapshot = snapshotOf(MIXED_ASK);
  const previewSeeds = SEEDS.slice(0, 12);

  it('what the panel would show is what the placement carries, retries included', () => {
    const retried: string[] = [];
    for (const seed of previewSeeds) {
      const placement = generatePlacement(seed, snapshot, EMPTY, DELIVERABLE, EMPTY);
      const previewed = pondDemandsOfSnapshot(snapshot, seed, { capacity: DELIVERABLE });
      expect(previewed, seed).toEqual(placement.pondDemands);
      if (placement.stats.attempts > 1) retried.push(seed);
    }
    expect(retried.length, 'no seed in this set retried').toBeGreaterThan(0);
  }, 60_000);

  it('an attempt seed never reaches the roll', () => {
    const seed = previewSeeds[0];
    const settled = pondDemandsOfSnapshot(snapshot, seed, { capacity: DELIVERABLE });
    expect(pondDemandsOfSnapshot(snapshot, `${seed}#retry1`, { capacity: DELIVERABLE })).not.toEqual(settled);
    expect(Object.keys(settled)).toEqual(POND_PRIZE_LOCATIONS.slice(0, 6));
  });
});
