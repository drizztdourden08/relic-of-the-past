/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`) — do not delete with the scratch specs.
 *
 * `test-sanctuary-grounds` is the OUTDOOR navigation baseline. Indoor rooms are
 * bounded boxes; an overworld screen is the opposite case — open ground with
 * walkable edges into neighbours and an entrance to step into — and the two floods
 * take different paths through the code, so one baseline cannot cover both.
 *
 * The three ways out are the shape being pinned: two walkable edges to adjacent
 * screens and the Sanctuary door itself. Lose the edge handling and this collapses
 * to one exit with a much smaller reachable count.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-sanctuary-grounds is still the outdoor baseline', async () => {
  test.setTimeout(300_000);
  await withState('test-sanctuary-grounds', async (r) => {
    expect(await r.screenId(), 'the Sanctuary grounds are light-world screen 0x13').toMatch(/^lw-13 · LW/);

    const flood = await r.flood();
    // One screen only — this is the single-screen outdoor case on purpose.
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

    // Distinct destinations — three exits all naming one place would be a duplicate bug.
    expect(new Set(exits.map((row) => row.label)).size).toBe(3);
  });
});
