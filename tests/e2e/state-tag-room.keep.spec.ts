/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * `test-tag-room` is the kill-gate room (room tag 0x08, "clear enemies →
 * doors open"): trap shutters, a small-key door, and a guard carrying the key.
 * The decoded TAG is the fragile part: if the tag table regresses the room
 * looks like an ordinary corridor with permanent shutters. Pinned: the decode,
 * three barriers, two triggers and the reachable count.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-tag-room still decodes its kill gate', async () => {
  test.setTimeout(300_000);
  await withState('test-tag-room', async (r) => {
    expect(await r.screenId(), 'the Boomerang Chest Room is screen-127 (room 0x071)').toMatch(/^screen-127 · 0x71 · INDOOR/);

    // The flood is what derives the annotations, so it has to run first.
    const flood = await r.flood();
    expect(flood, 'the shut trap shutters bound the flood').toEqual({ reachable: 1338, total: 12288 });

    // The decoded tag, not the raw 0x08.
    const tags = await r.tags();
    expect(tags, `no room tag decoded; tags were ${JSON.stringify(tags)}`).toHaveLength(1);
    expect(tags[0]).toMatch(/clear enemies/);
    expect(tags[0]).toMatch(/doors open/);

    expect(await r.groups()).toEqual({ 'Checks': 2, 'Locks & barriers': 4, 'Triggers': 3, 'Ways out': 2 });

    const rows = await r.rows();
    // Both shutters are the trap kind, and they must be shut for the gate to mean anything.
    const shutters = rows.filter((row) => row.kind === 'shutter');
    expect(shutters, `expected two trap shutters, got ${JSON.stringify(rows)}`).toHaveLength(2);
    for (const shutter of shutters) {
      expect(shutter.state).toBe('shut');
      expect(shutter.detail, 'a trap shutter says it reopens on clearing the room').toMatch(/clear the room to reopen/);
    }

    // The kill trigger is what will reopen them, and it cites the tag it came from.
    const trigger = rows.find((row) => row.kind === 'kill-trigger');
    expect(trigger, `no kill-trigger row in ${JSON.stringify(rows)}`).toBeDefined();
    expect(trigger?.detail, 'the trigger cites the room tag it decoded').toMatch(/0x8/);

    // A guard holds the small key, so the key door is gated on combat too.
    expect(rows.some((row) => row.kind === 'key-carrier'), 'the key guard must be annotated').toBe(true);
    expect(rows.some((row) => row.kind === 'key-door'), 'the small-key door must be annotated').toBe(true);
  });
});
