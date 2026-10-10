/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SlotMigrationError, migrateScheme, migrateSlotList } from '@rotp/input-mapping';
import type { SlotAssignment } from '@rotp/game-data';
import { required } from './required';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(__dirname, '../../../tests/fixtures', name), 'utf8'));

const profile = fixture('spc2-profile.json') as { modern: { slots: unknown[] } };
const sdlOrdered = fixture('sdl-order-profile.json') as {
  modern: { slots: unknown[] };
  assignments: Record<string, SlotAssignment>;
};
const storedAssignments = fixture('spc2-assignments.json') as Record<string, SlotAssignment>;

const OLD_IDS = [
  'slot:NORTH', 'slot:WEST', 'slot:EAST', 'slot:SOUTH',
  'slot:LEFT_SHOULDER', 'slot:RIGHT_SHOULDER', 'slot:LEFT_TRIGGER', 'slot:RIGHT_TRIGGER',
  'slot:LEFT_PADDLE1', 'slot:RIGHT_PADDLE1', 'slot:LEFT_STICK', 'slot:RIGHT_STICK',
];

describe('numbered-slot migration, against the stored spc2-test profile', () => {
  it('numbers the stored list 1..N, face buttons already canonical', () => {
    const { slots } = migrateSlotList(profile.modern.slots);
    expect(slots).toHaveLength(OLD_IDS.length);
    expect(slots.map((slot) => slot.index)).toEqual(OLD_IDS.map((_, i) => i + 1));
    expect(required(slots[0], 'slot 1').position).toBe('NORTH');
    expect(required(slots[11], 'slot 12').position).toBe('RIGHT_STICK');
  });

  it('keeps the binding and the position independent, as the fixture relies on', () => {
    const { slots } = migrateSlotList(profile.modern.slots);
    const first = required(slots[0], 'slot 1');
    expect(first.position).toBe('NORTH');
    expect(first.binding).toMatchObject({ type: 'keyboard', code: 'KeyW' });
  });

  it('moves every assignment onto its own slot number, losing none', () => {
    const { assignments } = migrateScheme(profile.modern.slots, storedAssignments);
    expect(Object.keys(assignments)).toHaveLength(Object.keys(storedAssignments).length);
    for (const [oldId, assignment] of Object.entries(storedAssignments)) {
      const expected = OLD_IDS.indexOf(oldId) + 1;
      expect(assignments[expected]).toEqual(assignment);
    }
  });

  it('gives back the four assignments the face-and-d-pad-only cap had stranded', () => {
    const { assignments } = migrateScheme(profile.modern.slots, storedAssignments);
    expect(assignments[5]).toEqual({ kind: 'item', hudItem: 13 });
    expect(assignments[6]).toEqual({ kind: 'item', hudItem: 1 });
    expect(assignments[7]).toEqual({ kind: 'item', hudItem: 21 });
    expect(assignments[8]).toEqual({ kind: 'item', hudItem: 2 });
  });

  it('is idempotent, because the boot path runs it more than once', () => {
    const once = migrateScheme(profile.modern.slots, storedAssignments);
    const twice = migrateScheme(once.slots, once.assignments);
    expect(twice.slots).toEqual(once.slots);
    expect(twice.assignments).toEqual(once.assignments);
  });

  it('still matches an old assignment table against an ALREADY numbered list', () => {
    const { slots } = migrateSlotList(profile.modern.slots);
    const { assignments } = migrateScheme(slots, storedAssignments);
    expect(assignments[1]).toEqual({ kind: 'item', hudItem: 4 });
    expect(assignments[4]).toEqual({ kind: 'sword' });
    expect(Object.keys(assignments)).toHaveLength(8);
  });
});

describe('numbered-slot migration, against the stored spc2-test profile', () => {
  it('recovers an assignment whose slot is not in the list at all', () => {
    const { slots, assignments } = migrateScheme(
      [{ id: 'slot:NORTH', binding: { type: 'none' }, position: 'NORTH', label: 'X' }],
      { 'slot:kb:KeyF': { kind: 'action' } },
    );
    expect(slots).toHaveLength(2);
    expect(required(slots[1], 'the recovered slot').binding).toMatchObject({ type: 'keyboard', code: 'KeyF' });
    expect(assignments[2]).toEqual({ kind: 'action' });
  });

  it('throws instead of silently dropping what it cannot read', () => {
    expect(() => migrateSlotList('not a list')).toThrow(SlotMigrationError);
    expect(() => migrateSlotList([42])).toThrow(SlotMigrationError);
    expect(() => migrateScheme([], 'not a table')).toThrow(SlotMigrationError);
    expect(() => migrateScheme([], { 'wat:NORTH': { kind: 'sword' } })).toThrow(/wat:NORTH/);
  });

  it('does not disturb a list that already carries numbers', () => {
    const numbered = [
      { index: 1, binding: { type: 'none' }, position: 'SOUTH', label: 'B' },
      { index: 2, binding: { type: 'none' }, position: 'NORTH', label: 'X' },
    ];
    const { slots } = migrateSlotList(numbered);
    expect(slots.map((slot) => slot.position)).toEqual(['SOUTH', 'NORTH']);
  });
});

describe('a real profile stored in SDL device order', () => {
  it('comes out with NORTH as slot 1, not SOUTH', () => {
    const { slots } = migrateSlotList(sdlOrdered.modern.slots);
    expect(slots.map((slot) => slot.position)).toEqual([
      'NORTH', 'WEST', 'EAST', 'SOUTH',
      'DPAD_UP', 'DPAD_LEFT', 'DPAD_RIGHT', 'DPAD_DOWN',
    ]);
    const first = required(slots[0], 'slot 1');
    expect(first.position).toBe('NORTH');
    expect(first.binding).toMatchObject({ type: 'gamepad-button', index: 3 });
  });

  it('carries every assignment onto the number its own slot landed on', () => {
    const { assignments } = migrateScheme(sdlOrdered.modern.slots, sdlOrdered.assignments);
    expect(assignments[1]).toEqual({ kind: 'item', hudItem: 2 });
    expect(assignments[3]).toEqual({ kind: 'action' });
    expect(assignments[4]).toEqual({ kind: 'sword' });
    expect(assignments[5]).toEqual({ kind: 'item', hudItem: 11 });
    expect(Object.keys(assignments)).toHaveLength(4);
  });

  it('is idempotent, so a second read leaves the sorted list alone', () => {
    const once = migrateScheme(sdlOrdered.modern.slots, sdlOrdered.assignments);
    const twice = migrateScheme(once.slots, once.assignments);
    expect(twice.slots).toEqual(once.slots);
    expect(twice.assignments).toEqual(once.assignments);
  });
});
