/* @layer bridge-wasm @kind logic */
import type { RatioReadout } from './aspect-ratio.type';
import { buildReadout } from './build-readout';
import { viewportDims } from './viewport-dims';

const viewportReadout = (renderIntoNotch = true): RatioReadout => {
  const { long, short } = viewportDims(renderIntoNotch);
  return buildReadout(long, short);
};

export { viewportReadout };
