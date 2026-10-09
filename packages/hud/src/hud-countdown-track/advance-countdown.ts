/* @layer bridge-wasm @kind logic */
import type { CountdownReading, CountdownTrack } from './hud-countdown-track.type';
import { framesLeftOf } from './frames-left-of';

const stopped = (prev: CountdownTrack): CountdownTrack => (prev.running ? { ...prev, running: false } : prev);

const advanceCountdown = (prev: CountdownTrack, reading: CountdownReading): CountdownTrack => {
  const { seconds, frames, isRunning, isIndoors } = reading;
  if (!isRunning || isIndoors) return stopped(prev);
  const isClearedValue = seconds === 0 && !prev.running;
  if (isClearedValue) return prev;

  const framesLeft = framesLeftOf(seconds, frames);
  const started = !prev.running || seconds > prev.remaining;
  const total = started ? seconds : prev.total;
  const totalFrames = started ? framesLeft : prev.totalFrames;
  const fractionLeft = totalFrames > 0 ? Math.min(1, framesLeft / totalFrames) : 0;

  const unchanged = prev.running && prev.total === total && prev.totalFrames === totalFrames
    && prev.remaining === seconds && prev.fractionLeft === fractionLeft;
  return unchanged ? prev : { running: true, total, totalFrames, remaining: seconds, fractionLeft };
};

export { advanceCountdown };
