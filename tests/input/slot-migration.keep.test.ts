/* @layer test @kind test */
/**
 * Reading a REAL profile written before slots were numbers.
 *
 * The fixture is the `spc2-test` profile the visual campaign ran against: a
 * twelve-slot list keyed by SDL position (`slot:NORTH` to `slot:RIGHT_STICK`)
 * and an eight-entry assignment table keyed the same way. Four of its entries sit on
 * shoulders and triggers, the controls contract §15's cap made inert. It is the
 * exact shape a player's disk holds today, not a hand-written approximation.
 *
 * What is proved here:
 *  - the twelve slots come back as 1..12, the four face buttons already in the
 *    canonical order and everything the order does not name behind them;
 *  - every assignment lands on its own slot's number, including the four §15
 *    stranded, which the removal of the cap gives back;
 *  - nothing is lost, with eight assignments in and eight out;
 *  - migrating twice changes nothing (the boot path runs it more than once);
 *  - a table whose keys survived the list being renumbered still migrates,
 *    because old ids are reconstructed from `position` and from a key binding;
 *  - a shape that cannot be read throws instead of returning a shorter table.
 *
 * The second fixture, the OTHER real profile on this machine, is `spc2-test`'s
 * own stored list in SDL's device order (SOUTH, EAST, WEST, NORTH, ...), and
 * it is the one that proves the defect is closed: numbered as it lay, slot 1
 * was the south button while every shipped document draws slot 1 on the north
 * arm, so the HUD came out the right shape with the letters permuted.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SlotMigrationError, migrateScheme, migrateSlotList } from '@shared/input/scheme';
import type { SlotAssignment } from '@shared/types/controls';

/** These three live in `tests/fixtures/`, which is TRACKED. They used to sit in
 *  `tests/scratch/fixtures/`, which is gitignored, and a permanent test reading a
 *  fixture nobody clones is a test that only passes on the machine that wrote it. */
const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(__dirname, '../fixtures', name), 'utf8'));

const profile = fixture('spc2-profile.json') as { modern: { slots: unknown[] } };
const sdlOrdered = fixture('sdl-order-profile.json') as {
  modern: { slots: unknown[] };
  assignments: Record<string, SlotAssignment>;
};
const storedAssignments = fixture('spc2-assignments.json') as Record<string, SlotAssignment>;

/** The fixture's own slot order, which migration promises to preserve. */
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
    // Position is display only and survives; the number is the identity.
    expect(slots[0].position).toBe('NORTH');
    expect(slots[11].position).toBe('RIGHT_STICK');
  });

  it('keeps the binding and the position independent, as the fixture relies on', () => {
    const { slots } = migrateSlotList(profile.modern.slots);
    // Drawn as the NORTH button, driven by the W key. Nothing requires the two
    // to describe the same device.
    expect(slots[0].position).toBe('NORTH');
    expect(slots[0].binding).toMatchObject({ type: 'keyboard', code: 'KeyW' });
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
    // Shoulders 5 and 6 and triggers 7 and 8 were inert under §15 and are live again under §19.
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
    // The slot list is migrated when the profile is read and the table when the
    // settings are, so the second call sees a list whose ids are long gone.
    const { slots } = migrateSlotList(profile.modern.slots);
    const { assignments } = migrateScheme(slots, storedAssignments);
    expect(assignments[1]).toEqual({ kind: 'item', hudItem: 4 });    // slot:NORTH
    expect(assignments[4]).toEqual({ kind: 'sword' });               // slot:SOUTH
    expect(Object.keys(assignments)).toHaveLength(8);
  });

  it('recovers an assignment whose slot is not in the list at all', () => {
    const { slots, assignments } = migrateScheme(
      [{ id: 'slot:NORTH', binding: { type: 'none' }, position: 'NORTH', label: 'X' }],
      { 'slot:kb:KeyF': { kind: 'action' } },
    );
    expect(slots).toHaveLength(2);
    expect(slots[1].binding).toMatchObject({ type: 'keyboard', code: 'KeyF' });
    expect(assignments[2]).toEqual({ kind: 'action' });
  });

  it('throws instead of silently dropping what it cannot read', () => {
    expect(() => migrateSlotList('not a list')).toThrow(SlotMigrationError);
    expect(() => migrateSlotList([42])).toThrow(SlotMigrationError);
    expect(() => migrateScheme([], 'not a table')).toThrow(SlotMigrationError);
    expect(() => migrateScheme([], { 'wat:NORTH': { kind: 'sword' } })).toThrow(/wat:NORTH/);
  });

  it('does not disturb a list that already carries numbers', () => {
    // The player's own order, once migrated, is theirs, so nothing re-sorts it.
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
    // The shipped documents draw slot 1 on the north face arm; numbered as the
    // file lay, slot 1 was SOUTH and the whole cluster read permuted.
    expect(slots[0].position).toBe('NORTH');
    expect(slots[0].binding).toMatchObject({ type: 'gamepad-button', index: 3 });
  });

  it('carries every assignment onto the number its own slot landed on', () => {
    const { assignments } = migrateScheme(sdlOrdered.modern.slots, sdlOrdered.assignments);
    expect(assignments[1]).toEqual({ kind: 'item', hudItem: 2 });   // slot:NORTH  -> 1
    expect(assignments[3]).toEqual({ kind: 'action' });             // slot:EAST   -> 3
    expect(assignments[4]).toEqual({ kind: 'sword' });              // slot:SOUTH  -> 4
    expect(assignments[5]).toEqual({ kind: 'item', hudItem: 11 });  // slot:DPAD_UP -> 5
    expect(Object.keys(assignments)).toHaveLength(4);
  });

  it('is idempotent, so a second read leaves the sorted list alone', () => {
    const once = migrateScheme(sdlOrdered.modern.slots, sdlOrdered.assignments);
    const twice = migrateScheme(once.slots, once.assignments);
    expect(twice.slots).toEqual(once.slots);
    expect(twice.assignments).toEqual(once.assignments);
  });
});
