/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * `test-sanctuary-grounds` is the OUTDOOR navigation baseline: open ground
 * with walkable edges into neighbours and an entrance, a different flood path
 * from a bounded room. Pinned: two walkable edges and the Sanctuary door. Lose
 * the edge handling and this collapses to one exit with a much smaller count.
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

    expect(await r.groups()).toEqual({ 'Ways out': 3 });

    const rows = await r.rows();
    const exits = rows.filter((row) => row.kind === 'exit');
    expect(exits, `outdoor exits missing: ${JSON.stringify(rows)}`).toHaveLength(3);

    // Each way out is reached by walking, so each carries a step distance.
    for (const exit of exits) {
      expect(exit.detail, `${exit.label} should report a walk distance`).toMatch(/\d+ steps/);
    }

    // Distinct destinations, because three exits all naming one place would be a duplicate bug.
    expect(new Set(exits.map((row) => row.label)).size).toBe(3);
  });
});
