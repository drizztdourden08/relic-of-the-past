/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { allowedRatio } from './allowed-ratio';
import { TALL_RATIO } from './ratio-capability.constants';

const rendersTall = (s: GameSettings): boolean => s.extendedRendering && allowedRatio(s) < TALL_RATIO;

export { rendersTall };
