/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * `test-big-screen` is the first castle's exterior, a FOUR-screen area
 * (0x1B/0x1C/0x23/0x24). Per-screen logic under-reports silently here: it
 * describes the one sub-screen the player stands on.
 *
 * The tell is arithmetic: one screen is 64×64 = 4096 tiles, so the area must
 * total 16384. The second tell: exits must include ways out on a DIFFERENT
 * sub-screen, which only happens if every screen was walked.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

/** One overworld screen's collision grid. */
const TILES_PER_SCREEN = 4096;
const SCREENS = 4;

test('test-big-screen covers every sub-screen, not just Link\'s', async () => {
  test.setTimeout(300_000);
  await withState('test-big-screen', async (r) => {
    expect(await r.screenId(), 'the castle exterior is screen-062, light-world screen 0x1b').toMatch(/^screen-062 · 0x1B · LW/);

    const flood = await r.flood();
    // The total is the arithmetic proof that all four screens were flooded.
    expect(flood.total, `${SCREENS} screens × ${TILES_PER_SCREEN} tiles`).toBe(SCREENS * TILES_PER_SCREEN);
    expect(flood.reachable, 'the blessed multi-screen reachable count').toBe(3546);

    expect(await r.groups()).toEqual({ 'Ways out': 15 });

    const rows = await r.rows();
    const exits = rows.filter((row) => row.kind === 'exit');
    expect(exits).toHaveLength(15);

    // More than one sub-screen contributed: some exits are annotated as being on
    // another screen than the one Link occupies.
    const elsewhere = exits.filter((row) => /other screen/.test(row.detail ?? ''));
    expect(
      elsewhere.length,
      `no exit came from a neighbouring sub-screen, so the area collapsed to one screen: ${JSON.stringify(exits)}`,
    ).toBeGreaterThan(0);

    // And the exits are not all copies of one screen's set.
    expect(new Set(exits.map((row) => row.label)).size, 'distinct destinations across the area').toBeGreaterThan(1);
  });
});
