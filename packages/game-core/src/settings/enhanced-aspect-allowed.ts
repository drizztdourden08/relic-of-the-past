/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { settingsAspectRatioValue } from '../aspect-ratio';
import { MIN_ENHANCED_ASPECT } from './settings.constants';

const enhancedAspectAllowed = (s: GameSettings): boolean => settingsAspectRatioValue(s) >= MIN_ENHANCED_ASPECT;

export { enhancedAspectAllowed };
