/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';

test('test-sanctuary-grounds is still the outdoor baseline', async () => {
  test.setTimeout(300_000);
  await withState('test-sanctuary-grounds', async (r) => {
    expect(await r.screenId(), 'the Sanctuary grounds are screen-061, light-world screen 0x13').toMatch(/^screen-061 · 0x13 · LW/);

    const flood = await r.flood();
    expect(flood.total, 'a single overworld screen').toBe(4096);
    expect(flood.reachable, 'the blessed outdoor reachable count').toBe(1762);

    expect(await r.groups()).toEqual({});
  });
});
