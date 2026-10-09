/* @layer bridge-wasm @kind logic */
import { detectScreenRatio } from './detect-screen-ratio';
import { detectViewportRatio } from './detect-viewport-ratio';
import { effectiveCustomRatio } from './effective-custom-ratio';
import { parseRatioString } from './parse-ratio-string';

const aspectRatioValue = (ratio: string, customW: number, customH: number, renderIntoNotch = true): number => {
  if (ratio === 'auto') {
    const { w, h } = detectViewportRatio(renderIntoNotch);
    return w / h;
  }
  if (ratio === 'screen') {
    const { w, h } = detectScreenRatio(true);
    return w / h;
  }
  if (ratio === 'custom') {
    const { w, h } = effectiveCustomRatio(customW, customH, renderIntoNotch);
    return w / h;
  }
  return parseRatioString(ratio);
};

export { aspectRatioValue };
