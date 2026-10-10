/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-tag-room still decodes its kill gate', async () => {
  test.setTimeout(300_000);
  await withState('test-tag-room', async (r) => {
    expect(await r.screenId(), 'the Boomerang Chest Room is screen-127 (room 0x071)').toMatch(/^screen-127 · 0x71 · INDOOR/);

    const flood = await r.flood();
    expect(flood, 'the shut trap shutters bound the flood').toEqual({ reachable: 1338, total: 12288 });

    const tags = await r.tags();
    expect(tags, `no room tag decoded; tags were ${JSON.stringify(tags)}`).toHaveLength(1);
    expect(tags[0]).toMatch(/clear enemies/);
    expect(tags[0]).toMatch(/doors open/);

    expect(await r.groups()).toEqual({ 'Checks': 2, 'Locks & barriers': 4, 'Triggers': 3 });

    const rows = await r.rows();
    const shutters = rows.filter((row) => row.kind === 'shutter');
    expect(shutters, `expected two trap shutters, got ${JSON.stringify(rows)}`).toHaveLength(2);
    for (const shutter of shutters) {
      expect(shutter.state).toBe('shut');
      expect(shutter.detail, 'a trap shutter says it reopens on clearing the room').toMatch(/clear the room to reopen/);
    }

    const trigger = rows.find((row) => row.kind === 'kill-trigger');
    expect(trigger, `no kill-trigger row in ${JSON.stringify(rows)}`).toBeDefined();
    expect(trigger?.detail, 'the trigger cites the room tag it decoded').toMatch(/0x8/);

    expect(rows.some((row) => row.kind === 'key-carrier'), 'the key guard must be annotated').toBe(true);
    expect(rows.some((row) => row.kind === 'key-door'), 'the small-key door must be annotated').toBe(true);
  });
});
