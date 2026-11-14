/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { aspectRatioValue } from './aspect-ratio-value';

const settingsAspectRatioValue = (s: GameSettings): number =>
  aspectRatioValue({
    ratio: s.aspectRatio,
    customW: s.customAspectW,
    customH: s.customAspectH,
    renderIntoNotch: s.renderIntoNotch,
    keepOrientation: s.tallRendering === true,
  });

export { settingsAspectRatioValue };
