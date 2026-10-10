/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { emptySnapshot, cloneSnapshot, diffSnapshots, matchDiffs } from '@rotp/navigation';
import { describeDataset } from '../dataset-guard';

const CHEST_SLOT_0_MASK = 0x10;
const STARTING_HOUSE_ROOM = 0x104;
const UNCLAIMED_ROOM = 0x2;

describeDataset('flag-snapshot diffing', () => {
  it('produces no diffs for identical snapshots', () => {
    const a = emptySnapshot();
    const b = cloneSnapshot(a);
    expect(diffSnapshots(a, b)).toHaveLength(0);
  });

  it('reports the changed word, index, and newly-set bits for a room flag', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.dungInfo[STARTING_HOUSE_ROOM] = (after.dungInfo[STARTING_HOUSE_ROOM] ?? 0) | CHEST_SLOT_0_MASK;

    const diffs = diffSnapshots(before, after);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ kind: 'room', index: STARTING_HOUSE_ROOM, setBits: CHEST_SLOT_0_MASK });
  });

  it('diffs overworld and progress buffers independently', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.owEventInfo[0x81] = (after.owEventInfo[0x81] ?? 0) | 0x40;
    after.progress[2] = (after.progress[2] ?? 0) | 0x02;

    const diffs = diffSnapshots(before, after);
    const kinds = diffs.map(d => d.kind).sort();
    expect(kinds).toEqual(['overworld', 'progress']);
  });

  it('cloneSnapshot is a deep copy, so mutating the clone leaves the original clean', () => {
    const a = emptySnapshot();
    const b = cloneSnapshot(a);
    b.dungInfo[0] = 0x1234;
    expect(a.dungInfo[0]).toBe(0);
  });

  it('identifies a room-flag diff as the check whose chest bit it is', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.dungInfo[STARTING_HOUSE_ROOM] = (after.dungInfo[STARTING_HOUSE_ROOM] ?? 0) | CHEST_SLOT_0_MASK;
    const matched = matchDiffs(diffSnapshots(before, after));
    expect(matched?.id).toBe('check-026');
    expect(matched?.gameId).toMatchObject({ roomId: STARTING_HOUSE_ROOM, chestIndex: 0 });
  });

  it('identifies nothing when no check owns the changed bit', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.dungInfo[UNCLAIMED_ROOM] = (after.dungInfo[UNCLAIMED_ROOM] ?? 0) | CHEST_SLOT_0_MASK;
    expect(matchDiffs(diffSnapshots(before, after))).toBeUndefined();
  });
});
