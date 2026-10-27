/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeOverlay: Degrader<'overlay'> = (visual) => {
  if (isReady(visual.wide) && isReady(visual.original)) return visual;
  return isReady(visual.wide) ? { kind: 'single', shot: visual.wide } : null;
};

export { degradeOverlay };
