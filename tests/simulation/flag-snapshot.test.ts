/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { emptySnapshot, cloneSnapshot, diffSnapshots } from '../../shared/game/simulation/detect/flag-snapshot';
import { matchDiffs } from '../../shared/game/simulation/detect/check-matcher';

/** Chest-open bit for slot 0 — same native fact the matcher itself uses. */
const CHEST_SLOT_0_MASK = 0x10;

describe('flag-snapshot diffing', () => {
  it('produces no diffs for identical snapshots', () => {
    const a = emptySnapshot();
    const b = cloneSnapshot(a);
    expect(diffSnapshots(a, b)).toHaveLength(0);
  });

  it('reports the changed word, index, and newly-set bits for a room flag', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.dungInfo[0x104] |= CHEST_SLOT_0_MASK; // Link's House chest 0

    const diffs = diffSnapshots(before, after);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ kind: 'room', index: 0x104, setBits: CHEST_SLOT_0_MASK });
  });

  it('diffs overworld and progress buffers independently', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.owEventInfo[0x81] |= 0x40; // Zora's Ledge
    after.progress[2] |= 0x02;       // Bottle Merchant bit

    const diffs = diffSnapshots(before, after);
    const kinds = diffs.map(d => d.kind).sort();
    expect(kinds).toEqual(['overworld', 'progress']);
  });

  it('cloneSnapshot is a deep copy — mutating the clone leaves the original clean', () => {
    const a = emptySnapshot();
    const b = cloneSnapshot(a);
    b.dungInfo[0] = 0x1234;
    expect(a.dungInfo[0]).toBe(0);
  });

  it('identifies a room-flag diff as the check whose chest bit it is', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.dungInfo[0x104] |= CHEST_SLOT_0_MASK;
    const matched = matchDiffs(diffSnapshots(before, after));
    // The identity is the id; the name is only asserted as derived output.
    expect(matched?.id).toBe('check-026');
    expect(matched?.gameId).toMatchObject({ roomId: 0x104, chestIndex: 0 });
  });

  it('identifies nothing when no check owns the changed bit', () => {
    const before = emptySnapshot();
    const after = cloneSnapshot(before);
    after.dungInfo[0x2] |= 0x10; // no check maps to room 0x02 chest 0
    expect(matchDiffs(diffSnapshots(before, after))).toBeUndefined();
  });
});
