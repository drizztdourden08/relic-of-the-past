/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeTitle: Degrader<'title'> = (visual) => {
  if (!isReady(visual.video.poster)) return null;
  return { ...visual, swords: visual.swords.filter(isReady) };
};

export { degradeTitle };
