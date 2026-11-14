/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { settingsAspectRatioValue } from '../aspect-ratio';
import { baseRatio } from './base-ratio';

const requestedRatio = (s: GameSettings): number =>
  (s.aspectRatio === 'original' ? baseRatio(s) : settingsAspectRatioValue(s));

export { requestedRatio };
