/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * `test-sanctuary-grounds` is the OUTDOOR navigation baseline: open ground
 * with walkable edges into neighbours and an entrance, a different flood path
 * from a bounded room. The reachable count is the shape being pinned. Open
 * ground bounded by two walkable screen edges floods much further than a room,
 * so losing the edge handling collapses the count.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-sanctuary-grounds is still the outdoor baseline', async () => {
  test.setTimeout(300_000);
  await withState('test-sanctuary-grounds', async (r) => {
    expect(await r.screenId(), 'the Sanctuary grounds are screen-061, light-world screen 0x13').toMatch(/^screen-061 · 0x13 · LW/);

    const flood = await r.flood();
    // One screen only, because this is the single-screen outdoor case on purpose.
    expect(flood.total, 'a single overworld screen').toBe(4096);
    expect(flood.reachable, 'the blessed outdoor reachable count').toBe(1762);

    // Open ground with no checks, locks or triggers on it. Anything appearing
    // here is a mechanic being invented outdoors.
    expect(await r.groups()).toEqual({});
  });
});
