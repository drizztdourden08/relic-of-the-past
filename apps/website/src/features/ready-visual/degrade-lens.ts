/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeLens: Degrader<'lens'> = (visual) => {
  const { shot, before, after } = visual;
  if (isReady(shot) && isReady(before) && isReady(after)) return visual;
  return isReady(shot) ? { kind: 'single', shot } : null;
};

export { degradeLens };
