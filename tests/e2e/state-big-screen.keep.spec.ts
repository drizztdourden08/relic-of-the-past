/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

const TILES_PER_SCREEN = 4096;
const SCREENS = 4;

test('test-big-screen covers every sub-screen, not just Link\'s', async () => {
  test.setTimeout(300_000);
  await withState('test-big-screen', async (r) => {
    expect(await r.screenId(), 'the castle exterior is screen-062, light-world screen 0x1b').toMatch(/^screen-062 · 0x1B · LW/);

    const flood = await r.flood();
    expect(flood.total, `${SCREENS} screens × ${TILES_PER_SCREEN} tiles`).toBe(SCREENS * TILES_PER_SCREEN);
    expect(flood.reachable, 'the blessed multi-screen reachable count').toBe(3546);

    expect(await r.groups()).toEqual({});
  });
});
