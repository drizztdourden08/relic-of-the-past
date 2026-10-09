/* @layer renderer-components @kind logic */
import { NOISE_RATIO, WINDOW_FRAMES } from './noisy-bytes.constants';
import type { NoiseTracker } from './noisy-bytes.type';

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

export { observeFrame };
