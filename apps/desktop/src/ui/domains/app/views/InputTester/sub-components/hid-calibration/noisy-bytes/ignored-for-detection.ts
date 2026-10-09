/* @layer renderer-components @kind logic */
import type { NoiseTracker } from './noisy-bytes.type';

const ignoredForDetection = (excluded: Set<number>, tracker: NoiseTracker): Set<number> => {
  if (tracker.noisy.size === 0) return excluded;
  const out = new Set(excluded);
  for (const i of tracker.noisy) out.add(i);
  return out;
};

export { ignoredForDetection };
