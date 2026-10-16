/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { allowedRatio } from './allowed-ratio';
import { baseRatio } from './base-ratio';
import { RATIO_EPSILON } from './ratio-capability.constants';

const rendersExtended = (s: GameSettings): boolean =>
  s.extendedRendering && s.aspectRatio !== 'original' && Math.abs(allowedRatio(s) - baseRatio(s)) > RATIO_EPSILON;

export { rendersExtended };
