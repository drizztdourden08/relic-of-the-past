/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * `test-links-house` is the canonical run start: every full simulator route
 * (`rescue`, `bigkey`) begins here. A state that drifted (a step, the Lamp,
 * the follower) silently changes what every route measures. Pinned: the room,
 * the uncle in tow, the blessed reachable count, both checks uncollected.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-links-house is still the canonical run start', async () => {
  test.setTimeout(300_000);
  await withState('test-links-house', async (r) => {
    expect(await r.screenId(), 'the starting house is screen-205, the intro variant (room 0x104)').toMatch(/^screen-205 · 0x104 · INDOOR/);

    // A follower is what makes this the intro and not a replay of the house later.
    const states = await r.states();
    expect(states.some((s) => /following$/.test(s)), `no follower chip in ${JSON.stringify(states)}`).toBe(true);

    const flood = await r.flood();
    expect(flood, 'blessed indoor reachability for the run start').toEqual({ reachable: 288, total: 4096 });

    expect(await r.groups()).toEqual({ 'Checks': 2, 'Ways out': 3 });

    // Nothing collected yet, so both checks must still be open.
    const summary = await r.checkSummary();
    expect(summary.done, 'the run start must have nothing collected').toBe(0);
    expect(summary.available).toBe(2);
  });
});
