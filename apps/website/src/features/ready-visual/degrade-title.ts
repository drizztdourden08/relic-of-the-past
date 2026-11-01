/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeTitle: Degrader<'title'> = (visual) => {
  const [first, second, ...rest] = visual.variants.filter((variant) => isReady(variant.video.poster) && isReady(variant.thumb));
  if (!first) return null;
  if (!second) return { kind: 'video', video: first.video };
  return { kind: 'title', variants: [first, second, ...rest] };
};

export { degradeTitle };
