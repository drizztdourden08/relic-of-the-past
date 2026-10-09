/* @layer bridge-wasm @kind logic */
import type { RatioReadout } from './aspect-ratio.type';
import { buildReadout } from './build-readout';
import { screenDims } from './screen-dims';

const screenReadout = (renderIntoNotch = true): RatioReadout => {
  const { long, short } = screenDims(renderIntoNotch);
  return buildReadout(long, short);
};

export { screenReadout };
