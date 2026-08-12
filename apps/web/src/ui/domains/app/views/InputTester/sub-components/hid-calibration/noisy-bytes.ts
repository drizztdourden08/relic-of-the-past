/* @layer renderer-components @kind logic */
/**
 * Which byte positions keep moving on their own.
 *
 * A pad with motion sensors or analog sticks reports several bytes that never
 * hold still, and detection needs to tell those apart from an input someone
 * actually pressed. The distinction is frequency, not amount: a held button
 * changes its byte once when it goes down and once when it comes up, while a
 * motion or analog byte changes on nearly every frame. So this counts, per
 * byte, how often the value differs from the previous frame across a rolling
 * window, and reports the ones that move most of the time.
 *
 * Deliberately separate from the wizard's excluded set and from byte statuses:
 * knowing a byte is restless is not the same as claiming it belongs to a stick,
 * and it must never recolour a cell.
 */

/** Frames per measurement window. About a second at a typical report rate. */
const WINDOW_FRAMES = 60;
/** Share of the window a byte must move in to count as restless. */
const NOISE_RATIO = 0.25;

interface NoiseTracker {
  prev: Uint8Array;
  counts: Uint32Array;
  frames: number;
  noisy: Set<number>;
}

const createNoiseTracker = (): NoiseTracker => ({
  prev: new Uint8Array(0),
  counts: new Uint32Array(0),
  frames: 0,
  noisy: new Set<number>(),
});

/** Feed one report. Recomputes `noisy` once per completed window. */
const observeFrame = (tracker: NoiseTracker, bytes: Uint8Array): void => {
  if (tracker.counts.length !== bytes.length) {
    tracker.counts = new Uint32Array(bytes.length);
    tracker.prev = new Uint8Array(bytes);
    tracker.frames = 0;
    return;
  }
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== tracker.prev[i]) tracker.counts[i]++;
    tracker.prev[i] = bytes[i];
  }
  tracker.frames++;
  if (tracker.frames < WINDOW_FRAMES) return;

  const next = new Set<number>();
  const floor = tracker.frames * NOISE_RATIO;
  for (let i = 0; i < tracker.counts.length; i++) {
    if (tracker.counts[i] > floor) next.add(i);
  }
  tracker.noisy = next;
  tracker.counts.fill(0);
  tracker.frames = 0;
};

/** The excluded set plus anything currently restless, for detection only. */
const ignoredForDetection = (excluded: Set<number>, tracker: NoiseTracker): Set<number> => {
  if (tracker.noisy.size === 0) return excluded;
  const out = new Set(excluded);
  for (const i of tracker.noisy) out.add(i);
  return out;
};

export { createNoiseTracker, ignoredForDetection, observeFrame };
export type { NoiseTracker };
