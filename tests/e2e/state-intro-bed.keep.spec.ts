/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`) — do not delete with the scratch specs.
 *
 * `test-intro-bed` is the very first frame of the game: the player character is
 * asleep, the room has not brightened, and NO progress flag is set. It is the only
 * state where `link_player_handler_state == kPlayerState_AsleepInBed`, which makes
 * it the only way to check the "Asleep in bed" / "Waking up in bed" chips against
 * real memory rather than against a value we recorded ourselves.
 *
 * A static assertion would only prove the first chip, and the interesting claim is
 * the TRANSITION: "asleep" is derived from the handler state while
 * `player_sleep_in_bed_state` is a step counter that reads ZERO during sleep, so
 * the two chips come from two bytes read together. Getting that wrong shows up as
 * a chip that never changes, or one that says "waking" from the first frame.
 *
 * So this spec plays the opening and asserts each beat as it arrives:
 *
 *   1. asleep                      — the handler state, counter still 0
 *   2. waking up · wake step N     — the counter moved, the handler has not
 *   3. follower + progress flags    — the scene completed and wrote to SRAM
 *
 * Beat 3 is also the zero-baseline check from the other end: the state starts with
 * no progress chips at all, so the ones that appear here are the ones the intro
 * really sets — and the end state matches what `test-links-house` holds.
 *
 * Every beat waits on a chip predicate (`awaitState`), never on a frame count: the
 * uncle's dialogue and the screen fade run at whatever speed the machine allows.
 */
import { test, expect } from '@playwright/test';
import { withState } from './state-harness';
import type { StateReader } from './state-harness';

/** The sleep handler waits for a button before it advances, so beats need taps. */
const TAP_BUDGET = 30;

/**
 * Keep tapping through the scene until the chips satisfy `want`, then return them.
 *
 * The budget is a ceiling on taps, not a schedule: each iteration checks the chips
 * FIRST, so a fast machine leaves early and a slow one simply uses more of the
 * budget. Only exhausting it entirely is a failure, and the message then carries
 * the chips we actually saw.
 */
const tapUntil = async (r: StateReader, label: string, want: (chips: string[]) => boolean): Promise<string[]> => {
  let chips: string[] = [];
  for (let i = 0; i < TAP_BUDGET; i++) {
    chips = await r.states();
    if (want(chips)) return chips;
    // A and B both advance a message box; alternating avoids a stuck auto-repeat.
    await r.press(i % 2 === 0 ? 'A' : 'B', 200);
    await r.window.waitForTimeout(600);
  }
  throw new Error(`never reached "${label}" in ${TAP_BUDGET} taps; last chips: ${JSON.stringify(chips)}`);
};

const someMatch = (match: RegExp) => (chips: string[]) => chips.some((s) => match.test(s));
const noneMatch = (match: RegExp) => (chips: string[]) => !chips.some((s) => match.test(s));

test('test-intro-bed plays the opening and reports each beat', async () => {
  test.setTimeout(600_000);
  await withState('test-intro-bed', async (r) => {
    expect(await r.screenId(), 'the intro bed scene is room 0x104').toMatch(/^room-104 · INDOOR/);

    // ── Beat 1: asleep, before any input ──────────────────────────────────────
    const asleep = await r.awaitState(/asleep/i);
    expect(asleep, 'the sleep step counter reads 0, so no "waking" detail yet').not.toMatch(/wake step/);

    // Nothing has happened yet: this state is the zero baseline for progress flags.
    const atStart = await r.states();
    expect(atStart, `only the sleep chip may be active at the first frame: ${JSON.stringify(atStart)}`).toHaveLength(1);

    await r.enableKeyboard();

    // ── Beat 2: the counter moves while the handler state does not ────────────
    const waking = (await tapUntil(r, 'waking up in bed', someMatch(/waking/i))).find((s) => /waking/i.test(s));
    expect(waking, 'the "waking" chip carries the step the counter reached').toMatch(/wake step \d+/);

    // ── Beat 3: the scene completes and writes to SRAM ─────────────────────────
    const done = await tapUntil(r, 'a follower in tow', someMatch(/following$/));

    // A progress flag now exists that did not exist at the first frame — the intro
    // wrote it, so a chip appearing here is a true positive rather than noise.
    const flags = done.filter((s) => !/following$/.test(s) && !/asleep|waking/i.test(s));
    expect(flags.length, `the intro must set at least one progress flag; chips: ${JSON.stringify(done)}`).toBeGreaterThan(0);

    // ── Beat 4: out of bed — the sleep chips clear, the follower stays ─────────
    const settled = await tapUntil(r, 'out of bed', noneMatch(/asleep|waking/i));
    expect(settled.some((s) => /following$/.test(s)), 'the follower survives waking up').toBe(true);
  });
});
