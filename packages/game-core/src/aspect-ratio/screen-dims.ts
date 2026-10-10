/* @layer bridge-wasm @kind logic */
import type { LandscapePair } from './aspect-ratio.type';
import { FALLBACK_HEIGHT, FALLBACK_WIDTH } from './aspect-ratio.constants';
import { landscapePair } from './landscape-pair';

const screenDims = (renderIntoNotch: boolean): LandscapePair => {
  const sw = (typeof window !== 'undefined' && window.screen.width) || FALLBACK_WIDTH;
  const sh = (typeof window !== 'undefined' && window.screen.height) || FALLBACK_HEIGHT;
  return landscapePair(sw, sh, renderIntoNotch);
};

export { screenDims };
