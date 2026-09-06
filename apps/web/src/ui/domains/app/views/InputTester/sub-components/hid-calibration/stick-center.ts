/* @layer renderer-components @kind logic */
/**
 * Records what a stick's bytes actually do while nobody is touching it.
 *
 * Rest is the one thing a sweep cannot show, and it is not a single number:
 * a real stick drifts, so the useful answer is the middle of where it sits
 * plus how far it wanders. Both come from watching for a fixed stretch of
 * time and keeping the extremes, instead of waiting for the values to stop
 * changing, which on a drifting stick never happens.
 *
 * Deliberately started by the user, not inferred. The moment the stick
 * is actually free is something only they know, and guessing it produced a
 * centre taken while the stick was still being held.
 */
import type { StickCandidate } from './hid-calibration.type';

/** How long a reading runs. Long enough to see drift, short enough to sit through. */
const IDLE_SAMPLE_MS = 1500;

interface IdleSampler {
  x: StickCandidate;
  y: StickCandidate | null;
  startedAt: number;
  /** Every value seen per tracked byte, in arrival order. */
  runs: number[][];
}

interface IdleAxisResult {
  center: number;
  /** Widest excursion from centre while at rest: a deadzone floor. */
  drift: number;
  min: number;
  max: number;
  /** How many distinct values it took, and over how many frames. A byte
   *  that never repeats is not an axis at rest, it is a counter. */
  uniqueCount: number;
  frames: number;
}

interface IdleResult {
  x: StickCandidate & { idle: IdleAxisResult };
  y: (StickCandidate & { idle: IdleAxisResult }) | null;
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const summarise = (values: number[]): IdleAxisResult => {
  const center = median(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    center,
    drift: Math.max(max - center, center - min),
    min,
    max,
    uniqueCount: new Set(values).size,
    frames: values.length,
  };
};

const createIdleSampler = (x: StickCandidate, y: StickCandidate | null, now: number): IdleSampler =>
  ({ x, y, startedAt: now, runs: y ? [[], []] : [[]] });

/**
 * Feeds one frame. Returns the finished reading once the window has elapsed,
 * or null while it is still running. `progress` is 0..1 for a caller showing
 * how much time is left.
 */
const observeIdleFrame = (sampler: IdleSampler, bytes: Uint8Array, now: number): { done: IdleResult | null; progress: number } => {
  const indices = sampler.y ? [sampler.x.idx, sampler.y.idx] : [sampler.x.idx];
  indices.forEach((byteIndex, slot) => sampler.runs[slot].push(bytes[byteIndex] ?? 0));

  const progress = Math.min(1, (now - sampler.startedAt) / IDLE_SAMPLE_MS);
  if (progress < 1 || sampler.runs.some((run) => run.length === 0)) return { done: null, progress };

  const xIdle = summarise(sampler.runs[0]);
  const yIdle = sampler.y ? summarise(sampler.runs[1]) : null;
  return {
    done: {
      x: { ...sampler.x, center: xIdle.center, idle: xIdle },
      y: sampler.y && yIdle ? { ...sampler.y, center: yIdle.center, idle: yIdle } : null,
    },
    progress: 1,
  };
};

export { createIdleSampler, observeIdleFrame, IDLE_SAMPLE_MS };
export type { IdleAxisResult, IdleResult, IdleSampler };
