/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from '../layer-window';
import { nextIndex, streamFor } from '../prng';

const orderPicker = (resolved: ResolvedLayer, seed: number): ((current: number) => number) => {
  const count = resolved.buffers.length;
  const order = resolved.layer.mode.kind === 'loop' ? resolved.layer.mode.order : 'sequential';
  if (count <= 1) return () => 0;
  if (order === 'sequential') return (current) => (current + 1) % count;
  const random = streamFor(seed, resolved.index);
  return (current) => {
    let candidate = current;
    while (candidate === current) candidate = nextIndex(random, count);
    return candidate;
  };
};

export { orderPicker };
