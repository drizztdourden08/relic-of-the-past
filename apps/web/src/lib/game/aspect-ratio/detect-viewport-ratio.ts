/* @layer bridge-wasm @kind logic */
import type { RatioPair } from './aspect-ratio.type';
import { clampAndReduce } from './clamp-and-reduce';
import { viewportDims } from './viewport-dims';

const detectViewportRatio = (renderIntoNotch = true): RatioPair => {
  const { long, short } = viewportDims(renderIntoNotch);
  return clampAndReduce(long, short);
};

export { detectViewportRatio };
