/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeClip: Degrader<'clip'> = (visual) => {
  const { poster, loop, after } = visual;
  if (isReady(poster) && isReady(loop) && isReady(after)) return visual;
  return isReady(after) ? { kind: 'single', shot: after } : null;
};

export { degradeClip };
