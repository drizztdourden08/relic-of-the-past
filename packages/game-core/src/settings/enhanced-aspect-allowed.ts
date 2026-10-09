/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { aspectRatioValue } from '../aspect-ratio';
import { MIN_ENHANCED_ASPECT } from './settings.constants';

const enhancedAspectAllowed = (s: GameSettings): boolean =>
  aspectRatioValue(s.aspectRatio, s.customAspectW, s.customAspectH, s.renderIntoNotch) >= MIN_ENHANCED_ASPECT;

export { enhancedAspectAllowed };
