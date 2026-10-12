/* @layer bridge-wasm @kind logic */
/**
 * Follows the game's HUD countdown across frames. The game exports the seconds left and the frames
 * left inside the current second, never the length of the countdown, so the first value seen when a
 * countdown starts stands for the whole of it.
 */

/** Frames the game spends on one counted second. */
const FRAMES_PER_SECOND = 62;

/** One reading of the countdown, as the UI state reports it. */
interface CountdownReading {
  seconds: number;
  frames: number;
  isRunning: boolean;
  /** The game counts down on the overworld only. Indoors the value is stale. */
  isIndoors: boolean;
}

interface CountdownTrack {
  running: boolean;
  /** Seconds the countdown started from. */
  total: number;
  /** Frames the countdown had to run when it started. */
  totalFrames: number;
  /** Whole seconds left. */
  remaining: number;
  /** Share of the countdown still to run, 1 down to 0. */
  fractionLeft: number;
}

const IDLE_TRACK: CountdownTrack = { running: false, total: 0, totalFrames: 0, remaining: 0, fractionLeft: 0 };

/** Frames until the seconds reach zero, which is when the game acts on the countdown. */
const framesLeftOf = (seconds: number, frames: number): number =>
  Math.max(0, (seconds - 1) * FRAMES_PER_SECOND + frames);

const stopped = (prev: CountdownTrack): CountdownTrack => (prev.running ? { ...prev, running: false } : prev);

const advanceCountdown = (prev: CountdownTrack, reading: CountdownReading): CountdownTrack => {
  const { seconds, frames, isRunning, isIndoors } = reading;
  if (!isRunning || isIndoors) return stopped(prev);
  // A zero with no countdown before it is a cleared value, which the game turns off a frame later.
  if (seconds === 0 && !prev.running) return prev;

  const framesLeft = framesLeftOf(seconds, frames);
  // A countdown starts when the value comes on, or when it rises while one is running.
  const started = !prev.running || seconds > prev.remaining;
  const total = started ? seconds : prev.total;
  const totalFrames = started ? framesLeft : prev.totalFrames;
  const fractionLeft = totalFrames > 0 ? Math.min(1, framesLeft / totalFrames) : 0;

  const unchanged = prev.running && prev.total === total && prev.totalFrames === totalFrames
    && prev.remaining === seconds && prev.fractionLeft === fractionLeft;
  return unchanged ? prev : { running: true, total, totalFrames, remaining: seconds, fractionLeft };
};

export { advanceCountdown, framesLeftOf, FRAMES_PER_SECOND, IDLE_TRACK };
export type { CountdownReading, CountdownTrack };
