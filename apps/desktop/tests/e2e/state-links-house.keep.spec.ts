/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-links-house is still the canonical run start', async () => {
  test.setTimeout(300_000);
  await withState('test-links-house', async (r) => {
    expect(await r.screenId(), 'the starting house is screen-205, the intro variant (room 0x104)').toMatch(/^screen-205 · 0x104 · INDOOR/);

    const states = await r.states();
    expect(states.some((s) => /following$/.test(s)), `no follower chip in ${JSON.stringify(states)}`).toBe(true);

    const flood = await r.flood();
    expect(flood, 'blessed indoor reachability for the run start').toEqual({ reachable: 288, total: 4096 });

    expect(await r.groups()).toEqual({ 'Checks': 2 });

    const summary = await r.checkSummary();
    expect(summary.done, 'the run start must have nothing collected').toBe(0);
    expect(summary.available).toBe(2);
  });
});
