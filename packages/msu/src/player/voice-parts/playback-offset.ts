/* @layer renderer-lib @kind logic */
import type { PlaybackSpan } from '../voice.type';

const playbackOffset = (elapsed: number, loop: boolean, span: PlaybackSpan): number => {
  const { duration, loopStart } = span;
  if (!loop || elapsed < duration) return Math.min(elapsed, duration);
  const loopLength = duration - loopStart;
  if (loopLength <= 0) return loopStart;
  return loopStart + ((elapsed - duration) % loopLength);
};

export { playbackOffset };
