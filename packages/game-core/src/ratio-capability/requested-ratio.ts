/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { aspectRatioValue } from '../aspect-ratio';
import { baseRatio } from './base-ratio';

const requestedRatio = (s: GameSettings): number =>
  (s.aspectRatio === 'original'
    ? baseRatio(s)
    : aspectRatioValue(s.aspectRatio, s.customAspectW, s.customAspectH, s.renderIntoNotch));

export { requestedRatio };
