/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { locationDisplayName } from '@shared/randomizer/world/display-names/location-display-name';
import { POND_INSTANCES } from '@shared/randomizer/world/pond/pond-instances';
import { POND_RUNGS_BY_ID } from '@shared/randomizer/world/pond/pond-rungs';
import { POND_REGION_LOCATIONS } from '@shared/randomizer/world/pond/pond-region-locations';
import { find } from '@rotp/game-data';

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
    expect(POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => locationDisplayName(slot.key)))).toEqual([
      'Hylia Fairy Bombs 1', 'Hylia Fairy Arrows 1',
      'Waterfall Fairy 1', 'Waterfall Fairy 2',
      'Pyramid Fairy 1', 'Pyramid Fairy 2',
    ]);
  });

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
