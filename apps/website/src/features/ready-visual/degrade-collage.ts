/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeCollage: Degrader<'collage'> = (visual) => {
  const [first, second, ...rest] = visual.layers.filter((layer) => isReady(layer.shot));
  if (!first) return null;
  if (!second) {
    return first.callouts ? { kind: 'pins', shot: first.shot, callouts: first.callouts } : { kind: 'single', shot: first.shot };
  }
  return { kind: 'collage', layers: [first, second, ...rest] };
};

export { degradeCollage };
