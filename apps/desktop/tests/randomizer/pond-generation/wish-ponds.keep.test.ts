/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { ITEM, generatePlacement, buildFillWorld, fillOptionsFromSnapshot, parsePondProfiles, POND_INSTANCES, POND_RUNGS_BY_ID } from '@rotp/randomizer';
import { ALL_NPC, ALL_POND_SLOTS, DELIVERABLE, EMPTY } from './pond-generation.constants';
import { snapshotOf } from './snapshot-of';
import { required } from '../../required';

describe('pond generation', () => {
  for (const pond of POND_INSTANCES.filter((entry) => entry.id !== 'capacity')) {
    const slots = pond.slots.map((slot) => slot.key);
    const worldOf = (mode: string, flag: boolean) => buildFillWorld({
      ...fillOptionsFromSnapshot(snapshotOf({
        [`pond_${pond.id}_mode`]: mode, [`pond_${pond.id}_items`]: 4, [`pond_${pond.id}_throws`]: 4,
      }), { npc: ALL_NPC, capacity: ALL_POND_SLOTS }, {}, 's'),
      pondSlotsFollowMode: flag,
    });
    const candidates = [...new Set([...slots, ...POND_RUNGS_BY_ID[pond.id]])];
    const present = (mode: string, flag = true): string[] => candidates
      .filter((name) => worldOf(mode, flag).world.locationsByKey.has(name));

    it(`${pond.label} at Vanilla grants locks both slots to what her upgrade produces`, () => {
      const locked = worldOf('capacity', true);
      expect(present('capacity')).toEqual(slots);
      for (const slot of pond.slots) expect(locked.lockedVanilla.get(slot.key), slot.key).toBe(slot.vanillaGrant);
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
      expect(present('custom', false)).toEqual(POND_RUNGS_BY_ID[pond.id].slice(0, 4));
      const snapshot = snapshotOf({ [`pond_${pond.id}_mode`]: 'custom', [`pond_${pond.id}_items`]: 4 });
      const placement = generatePlacement(`closed-${pond.id}`, snapshot, ALL_NPC, ALL_POND_SLOTS, EMPTY);
      for (const name of slots) expect(placement.locations[name], name).toBeDefined();
      for (const name of POND_RUNGS_BY_ID[pond.id].slice(4)) {
        expect(placement.locations[name], name).toBeUndefined();
      }
    }, 30_000);
  }
});

describe('pond generation', () => {
  it('the shared switch gives all three ponds the capacity pond settings', () => {
    const separate = {
      pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 4,
      pond_wishing_mode: 'vanilla-cost', pond_cursed_mode: 'capacity',
    };
    const off = required(
      fillOptionsFromSnapshot(snapshotOf(separate), { capacity: ALL_POND_SLOTS }, {}, 's').ponds, 'ponds with the switch off');
    expect(off.wishing).toMatchObject({ mode: 'vanilla-cost' });
    expect(off.cursed).toEqual({ mode: 'capacity' });
    const on = required(fillOptionsFromSnapshot(
      snapshotOf({ ...separate, pond_share: true }), { capacity: ALL_POND_SLOTS }, {}, 's').ponds, 'ponds with the switch on');
    for (const pond of POND_INSTANCES) expect(on[pond.id], pond.id).toEqual(on.capacity);
    expect(on.capacity).toEqual(off.capacity);
    expect(parsePondProfiles(snapshotOf({ ...separate, pond_share: true }).values).stored)
      .toEqual(parsePondProfiles(snapshotOf(separate).values).profiles);
    const placement = generatePlacement('pond-shared', snapshotOf({ ...separate, pond_share: true }), EMPTY, DELIVERABLE, EMPTY);
    expect(placement.stats.pondPrizeCount).toBeGreaterThan(0);
  }, 30_000);

  it('Vanilla grants with the npc switch off keeps a Blue Boomerang to throw', () => {
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
