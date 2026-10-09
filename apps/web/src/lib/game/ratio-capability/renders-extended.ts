/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { allowedRatio } from './allowed-ratio';
import { RATIO_EPSILON, TALL_RATIO } from './ratio-capability.constants';

const rendersExtended = (s: GameSettings): boolean =>
  s.extendedRendering && Math.abs(allowedRatio(s) - TALL_RATIO) > RATIO_EPSILON;

export { rendersExtended };
