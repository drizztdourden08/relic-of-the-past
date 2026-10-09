/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';
import type { StateReader } from './state-harness';

const TAP_BUDGET = 30;

const tapUntil = async (r: StateReader, label: string, want: (chips: string[]) => boolean): Promise<string[]> => {
  let chips: string[] = [];
  for (let i = 0; i < TAP_BUDGET; i++) {
    chips = await r.states();
    if (want(chips)) return chips;
    const alternateAAndB = i % 2 === 0 ? 'A' : 'B';
    await r.press(alternateAAndB, 200);
    await r.window.waitForTimeout(600);
  }
  throw new Error(`never reached "${label}" in ${TAP_BUDGET} taps; last chips: ${JSON.stringify(chips)}`);
};

const someMatch = (match: RegExp) => (chips: string[]) => chips.some((s) => match.test(s));
const noneMatch = (match: RegExp) => (chips: string[]) => !chips.some((s) => match.test(s));

test('test-intro-bed plays the opening and reports each beat', async () => {
  test.setTimeout(600_000);
  await withState('test-intro-bed', async (r) => {
    expect(await r.screenId(), 'the intro bed scene is screen-205, the intro variant (room 0x104)').toMatch(/^screen-205 · 0x104 · INDOOR/);

    const asleep = await r.awaitState(/asleep/i);
    expect(asleep, 'the sleep step counter reads 0, so no "waking" detail yet').not.toMatch(/wake step/);

    const atStart = await r.states();
    expect(atStart, `only the sleep chip may be active at the first frame: ${JSON.stringify(atStart)}`).toHaveLength(1);

    await r.enableKeyboard();

    const waking = (await tapUntil(r, 'waking up in bed', someMatch(/waking/i))).find((s) => /waking/i.test(s));
    expect(waking, 'the "waking" chip carries the step the counter reached').toMatch(/wake step \d+/);

    const done = await tapUntil(r, 'a follower in tow', someMatch(/following$/));

    const flags = done.filter((s) => !/following$/.test(s) && !/asleep|waking/i.test(s));
    expect(flags.length, `the intro must set at least one progress flag; chips: ${JSON.stringify(done)}`).toBeGreaterThan(0);

    const settled = await tapUntil(r, 'out of bed', noneMatch(/asleep|waking/i));
    expect(settled.some((s) => /following$/.test(s)), 'the follower survives waking up').toBe(true);
  });
});
