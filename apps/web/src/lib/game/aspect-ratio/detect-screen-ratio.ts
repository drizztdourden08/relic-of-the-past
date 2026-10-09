/* @layer bridge-wasm @kind logic */
import type { RatioPair } from './aspect-ratio.type';
import { clampAndReduce } from './clamp-and-reduce';
import { screenDims } from './screen-dims';

const detectScreenRatio = (renderIntoNotch = true): RatioPair => {
  const { long, short } = screenDims(renderIntoNotch);
  return clampAndReduce(long, short);
};

export { detectScreenRatio };
