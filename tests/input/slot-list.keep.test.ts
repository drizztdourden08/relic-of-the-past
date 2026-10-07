/* @layer test @kind test */
/**
 * The slot list is a LIST: appended to, removed from, and always numbered 1..N.
 *
 * The one thing that can go silently wrong here is the renumber. Numbers are
 * contiguous, so removing slot 2 makes the old slot 3 the new slot 2, and the
 * assignment table is keyed by number, so an item that does not move with it
 * lands one button up without anybody being told. That is what `remapAssignments`
 * exists for and what most of this file checks.
 */
import { describe, expect, it } from 'vitest';
import { addSlot, remapAssignments, removeSlot, renumberSlots, setSlotBinding } from '@shared/input/scheme';
import type { ModernSlot, SlotAssignment } from '@shared/types/controls';

const slot = (index: number, label = `Slot ${index}`): ModernSlot =>
  ({ index, binding: { type: 'none' }, label });

const listOf = (n: number): ModernSlot[] => Array.from({ length: n }, (_, i) => slot(i + 1));

describe('the numbered slot list', () => {
  it('appends an EMPTY slot, which still exists and still has a number', () => {
    const { slots } = addSlot(listOf(3));
    expect(slots).toHaveLength(4);
    expect(slots[3]).toMatchObject({ index: 4, binding: { type: 'none' }, label: 'Slot 4' });
  });

  it('grows without limit, so a thirty-button device is thirty slots', () => {
    let slots: ModernSlot[] = [];
    for (let i = 0; i < 30; i += 1) slots = addSlot(slots).slots;
    expect(slots).toHaveLength(30);
    expect(slots[29].index).toBe(30);
  });

  it('closes the gap on removal and renumbers what is below', () => {
    const { slots, renumber } = removeSlot(listOf(4), 2);
    expect(slots.map((s) => s.index)).toEqual([1, 2, 3]);
    expect(renumber.get(3)).toBe(2);
    expect(renumber.get(4)).toBe(3);
    expect(renumber.has(2)).toBe(false);   // the one that went
  });

  it('moves the assignments with the numbering, and drops only the removed one', () => {
    const assignments: Record<number, SlotAssignment> = {
      1: { kind: 'sword' },
      2: { kind: 'action' },
      3: { kind: 'item', hudItem: 7 },
      4: { kind: 'item', hudItem: 9 },
    };
    const { renumber } = removeSlot(listOf(4), 2);
    expect(remapAssignments(assignments, renumber)).toEqual({
      1: { kind: 'sword' },
      2: { kind: 'item', hudItem: 7 },
      3: { kind: 'item', hudItem: 9 },
    });
  });

  it('keeps the number when a slot is re-bound, which is the whole point', () => {
    const before = listOf(3);
    const after = setSlotBinding(before, 2, { type: 'keyboard', code: 'KeyX' });
    expect(after.map((s) => s.index)).toEqual([1, 2, 3]);
    expect(after[1].binding).toMatchObject({ type: 'keyboard', code: 'KeyX' });
    // Nothing else moved, so nothing keyed by a number moved either.
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[2]);
  });

  it('repairs a list whose numbering has a hole in it', () => {
    const { slots, renumber } = renumberSlots([slot(2), slot(5), slot(9)]);
    expect(slots.map((s) => s.index)).toEqual([1, 2, 3]);
    expect(renumber.get(5)).toBe(2);
  });
});
