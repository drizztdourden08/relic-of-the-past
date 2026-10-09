/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { aspectRatioValue } from '../aspect-ratio';

const requestedRatio = (s: GameSettings): number =>
  aspectRatioValue(s.aspectRatio, s.customAspectW, s.customAspectH);

export { requestedRatio };
