/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeRatios: Degrader<'ratios'> = (visual) => {
  const [first, second, ...rest] = visual.frames.filter((frame) => isReady(frame.shot));
  if (!first) return null;
  if (!second) return { kind: 'single', shot: first.shot };
  return { kind: 'ratios', frames: [first, second, ...rest] };
};

export { degradeRatios };
