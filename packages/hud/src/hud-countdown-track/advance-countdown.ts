/* @layer bridge-wasm @kind logic */
import type { CountdownReading, CountdownTrack } from './hud-countdown-track.type';
import { framesLeftOf } from './frames-left-of';

const stopped = (prev: CountdownTrack): CountdownTrack => (prev.running ? { ...prev, running: false } : prev);

const fractionLeftOf = (framesLeft: number, totalFrames: number): number =>
  (totalFrames > 0 ? Math.min(1, framesLeft / totalFrames) : 0);

const isSameTrack = (prev: CountdownTrack, next: CountdownTrack): boolean =>
  prev.running && prev.total === next.total && prev.totalFrames === next.totalFrames
  && prev.remaining === next.remaining && prev.fractionLeft === next.fractionLeft;

const advanceCountdown = (prev: CountdownTrack, reading: CountdownReading): CountdownTrack => {
  const { seconds, frames, isRunning, isIndoors } = reading;
  if (!isRunning || isIndoors) return stopped(prev);
  if (seconds === 0 && !prev.running) return prev;

  const framesLeft = framesLeftOf(seconds, frames);
  const started = !prev.running || seconds > prev.remaining;
  const total = started ? seconds : prev.total;
  const totalFrames = started ? framesLeft : prev.totalFrames;
  const next: CountdownTrack = {
    running: true, total, totalFrames, remaining: seconds, fractionLeft: fractionLeftOf(framesLeft, totalFrames),
  };
  return isSameTrack(prev, next) ? prev : next;
};

export { advanceCountdown };
