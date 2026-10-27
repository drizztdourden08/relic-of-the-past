/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeCompare: Degrader<'compare'> = (visual) => {
  const { before, after } = visual;
  if (isReady(before) && isReady(after)) return visual;
  const shot = [after, before].find(isReady);
  return shot ? { kind: 'single', shot } : null;
};

export { degradeCompare };
