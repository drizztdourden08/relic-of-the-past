/* @layer bridge-wasm @kind logic */
import type { RatioPair } from './aspect-ratio.type';
import { detectScreenRatio } from './detect-screen-ratio';

const effectiveCustomRatio = (w: number, h: number, renderIntoNotch = true): RatioPair =>
  w > 0 && h > 0 ? { w, h } : detectScreenRatio(renderIntoNotch);

export { effectiveCustomRatio };
