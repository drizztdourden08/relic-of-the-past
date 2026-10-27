/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeCompare: Degrader<'compare'> = (visual) => {
  const { before, after, insets = [] } = visual;
  if (isReady(before) && isReady(after)) return { ...visual, insets: insets.filter(isReady) };
  const shot = [after, before, ...insets].find(isReady);
  return shot ? { kind: 'single', shot } : null;
};

export { degradeCompare };
