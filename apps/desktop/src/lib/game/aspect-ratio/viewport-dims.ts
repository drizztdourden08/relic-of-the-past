/* @layer bridge-wasm @kind logic */
import type { LandscapePair } from './aspect-ratio.type';
import { FALLBACK_HEIGHT, FALLBACK_WIDTH } from './aspect-ratio.constants';
import { landscapePair } from './landscape-pair';

const viewportDims = (renderIntoNotch: boolean): LandscapePair => {
  const vw = (typeof window !== 'undefined' && window.innerWidth) || FALLBACK_WIDTH;
  const vh = (typeof window !== 'undefined' && window.innerHeight) || FALLBACK_HEIGHT;
  return landscapePair(vw, vh, renderIntoNotch);
};

export { viewportDims };
