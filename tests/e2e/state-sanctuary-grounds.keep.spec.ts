/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`) — do not delete with the scratch specs.
 *
 * `test-sanctuary-grounds` is the OUTDOOR navigation baseline. Indoor rooms are
 * bounded boxes; an overworld screen is the opposite case — open ground with
 * walkable edges into neighbours and an entrance to step into — and the two floods
 * take different paths through the code, so one baseline cannot cover both.
 *
 * The reachable count is the shape being pinned. Open ground bounded by two
 * walkable screen edges floods much further than a room; lose the edge handling
 * and the count collapses.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-sanctuary-grounds is still the outdoor baseline', async () => {
  test.setTimeout(300_000);
  await withState('test-sanctuary-grounds', async (r) => {
    expect(await r.screenId(), 'the Sanctuary grounds are screen-061, light-world screen 0x13').toMatch(/^screen-061 · 0x13 · LW/);

    const flood = await r.flood();
    // One screen only — this is the single-screen outdoor case on purpose.
    expect(flood.total, 'a single overworld screen').toBe(4096);
    expect(flood.reachable, 'the blessed outdoor reachable count').toBe(1762);

    // Open ground with no checks, locks or triggers on it — anything appearing
    // here is a mechanic being invented outdoors.
    expect(await r.groups()).toEqual({});
  });
});
