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
  bytes.forEach((value, i) => {
    const count = tracker.counts[i];
    if (count !== undefined && value !== tracker.prev[i]) tracker.counts[i] = count + 1;
    tracker.prev[i] = value;
  });
  tracker.frames++;
  if (tracker.frames < WINDOW_FRAMES) return;

  const next = new Set<number>();
  const floor = tracker.frames * NOISE_RATIO;
  tracker.counts.forEach((count, i) => {
    if (count > floor) next.add(i);
  });
  tracker.noisy = next;
  tracker.counts.fill(0);
  tracker.frames = 0;
};

export { observeFrame };
